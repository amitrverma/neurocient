import { cookies, headers } from "next/headers";
import { mutationProxyHeaders } from "@/lib/abuseProxy";

export type ArticleAccessResult =
  | { granted: true }
  | {
      granted: false;
      reason: "sign_in" | "membership" | "session" | "unavailable";
      message: string;
    };

export async function requestArticleAccess(
  slug: string,
): Promise<ArticleAccessResult> {
  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    return {
      granted: false,
      reason: "unavailable",
      message: "This Insight is temporarily unavailable. Please try again shortly.",
    };
  }

  try {
    const requestHeaders = await headers();
    const isPrefetch =
      requestHeaders.has("next-router-prefetch") ||
      requestHeaders.get("purpose")?.toLowerCase() === "prefetch";
    const fetchSite = requestHeaders.get("sec-fetch-site");
    const isTrustedNavigation = fetchSite === "same-origin" || fetchSite === "none";
    if (isPrefetch || !isTrustedNavigation) {
      return {
        granted: false,
        reason: "unavailable",
        message: "Open this Insight directly to continue reading.",
      };
    }

    const cookieHeader = (await cookies()).toString();
    const authorization = requestHeaders.get("authorization");
    const backendPath = `/articles/${encodeURIComponent(slug)}/access`;
    const host =
      requestHeaders.get("x-forwarded-host") ||
      requestHeaders.get("host") ||
      "localhost:3000";
    const protocol =
      requestHeaders.get("x-forwarded-proto") ||
      (host.startsWith("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https");
    const signingRequest = new Request(`${protocol}://${host}/insights/${encodeURIComponent(slug)}`, {
      method: "GET",
      headers: requestHeaders,
    });
    const backendHeaders: Record<string, string> = {
      Cookie: cookieHeader,
      "X-Neurocient-Access-Request": "insight-page",
      ...mutationProxyHeaders(signingRequest, backendPath, "POST"),
    };
    if (authorization) backendHeaders.Authorization = authorization;

    const response = await fetch(
      `${apiBaseUrl}${backendPath}`,
      {
        method: "POST",
        headers: backendHeaders,
        cache: "no-store",
        redirect: "manual",
      },
    );

    const contentType = response.headers.get("content-type")?.toLowerCase() || "";
    const body = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : null;
    if (response.status === 200 && body?.granted === true) {
      return { granted: true };
    }
    if (response.status === 401) {
      return {
        granted: false,
        reason: "session",
        message: "Your session has expired. Sign in again to continue reading.",
      };
    }
    if (response.status === 402) {
      return {
        granted: false,
        reason:
          body?.detail?.next_action === "sign_in" ? "sign_in" : "membership",
        message:
          body?.detail?.message ||
          "Your free Insight allowance has been used.",
      };
    }
  } catch {
    // Fail closed: content must not be returned when access is uncertain.
  }

  return {
    granted: false,
    reason: "unavailable",
    message: "This Insight is temporarily unavailable. Please try again shortly.",
  };
}
