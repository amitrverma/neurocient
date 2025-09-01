import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const res = await fetch(`${process.env.API_BASE_URL}/auth/signup`, {
    method: "POST",
    credentials: "include",   // 👈 allow cookie exchange
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  // Build Next.js response
  const nextRes = NextResponse.json(data, { status: res.status });

  // Forward ALL Set-Cookie headers from FastAPI
  const setCookies = (res.headers as any).getSetCookie?.() ?? res.headers.get("set-cookie");
  if (setCookies) {
    if (Array.isArray(setCookies)) {
      setCookies.forEach((cookie: string) => nextRes.headers.append("set-cookie", cookie));
    } else {
      nextRes.headers.set("set-cookie", setCookies);
    }
  }

  return nextRes;
}
