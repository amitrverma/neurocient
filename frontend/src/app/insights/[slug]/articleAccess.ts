import { cookies, headers } from "next/headers";

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
    const isCrossSiteSubresource =
      requestHeaders.get("sec-fetch-site") === "cross-site" &&
      (requestHeaders.get("sec-fetch-mode") !== "navigate" ||
        requestHeaders.get("sec-fetch-dest") !== "document");
    if (isPrefetch || isCrossSiteSubresource) {
      return {
        granted: false,
        reason: "unavailable",
        message: "Open this Insight directly to continue reading.",
      };
    }

    const cookieHeader = (await cookies()).toString();
    const authorization = requestHeaders.get("authorization");
    const backendHeaders: Record<string, string> = {
      Cookie: cookieHeader,
      "X-Neurocient-Access-Request": "insight-page",
    };
    if (authorization) backendHeaders.Authorization = authorization;

    const response = await fetch(
      `${apiBaseUrl}/articles/${encodeURIComponent(slug)}/access`,
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
