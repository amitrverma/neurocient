// src/app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { abuseProxyHeaders, backendResponseInit } from "@/lib/abuseProxy";

export async function POST(req: Request) {
  // 👇 Forward cookies from the browser to FastAPI
  const cookieHeader = req.headers.get("cookie") || "";

  const path = "/auth/refresh";
  const r = await fetch(`${process.env.API_BASE_URL}${path}`, {
    method: "POST",
    credentials: "include",   // allow cookie exchange
    headers: {
      "Content-Type": "application/json",
      "X-Neurocient-Auth-Request": "browser-bff",
      ...abuseProxyHeaders(req, path),
      cookie: cookieHeader,   // 👈 crucial: send refresh_token to FastAPI
    },
  });

  const data = await r.json().catch(() => ({}));

  // Build Next.js response
  const nextRes = NextResponse.json(data, backendResponseInit(r));

  // Forward ALL Set-Cookie headers from FastAPI
  const extendedHeaders = r.headers as Headers & {
    getSetCookie?: () => string[];
  };
  const setCookies: string[] =
    extendedHeaders.getSetCookie?.() ??
    (r.headers.get("set-cookie") ? [r.headers.get("set-cookie") as string] : []);

  if (setCookies && setCookies.length > 0) {
    setCookies.forEach((cookie: string) =>
      nextRes.headers.append("set-cookie", cookie)
    );
  }

  return nextRes;
}
