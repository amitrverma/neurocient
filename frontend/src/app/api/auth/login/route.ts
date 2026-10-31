import { NextResponse } from "next/server";
import { abuseProxyHeaders, backendResponseInit } from "@/lib/abuseProxy";

export async function POST(req: Request) {
  const body = await req.json();
  const cookie = req.headers.get("cookie") || "";

  const path = "/auth/login";
  const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",   // 👈 allow cookie exchange
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
      "X-Neurocient-Auth-Request": "browser-bff",
      ...abuseProxyHeaders(req, path),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  // Build Next.js response
  const nextRes = NextResponse.json(data, backendResponseInit(res));

  // Forward ALL Set-Cookie headers
  const extendedHeaders = res.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookies =
    extendedHeaders.getSetCookie?.() ?? res.headers.get("set-cookie");
  if (setCookies) {
    if (Array.isArray(setCookies)) {
      setCookies.forEach((cookie: string) => nextRes.headers.append("set-cookie", cookie));
    } else {
      nextRes.headers.set("set-cookie", setCookies);
    }
  }

  return nextRes;
}
