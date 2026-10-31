import { NextResponse } from "next/server";
import { abuseProxyHeaders, backendResponseInit } from "@/lib/abuseProxy";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cookie = req.headers.get("cookie") || "";
    const path = "/auth/firebase-login";
    const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
      method: "POST",
      credentials: "include", // 👈 cookie exchange
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
    const setCookies: string[] =
      extendedHeaders.getSetCookie?.() ??
      (res.headers.get("set-cookie") ? [res.headers.get("set-cookie") as string] : []);

    if (setCookies && setCookies.length > 0) {
      setCookies.forEach((cookie: string) =>
        nextRes.headers.append("set-cookie", cookie)
      );
    }

    return nextRes;
  } catch (err) {
    console.error("🔥 Error in firebase-login proxy:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}
