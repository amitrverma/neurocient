import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(
      "📨 [Proxy] Received token:",
      body.idToken?.slice(0, 30),
      "...",
      body.idToken?.length
    );

    const res = await fetch(`${process.env.API_BASE_URL}/auth/firebase-login`, {
      method: "POST",
      credentials: "include", // 👈 cookie exchange
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));

    // Build Next.js response
    const nextRes = NextResponse.json(data, { status: res.status });

    // Forward ALL Set-Cookie headers
    const setCookies: string[] =
      (res.headers as any).getSetCookie?.() ??
      (res.headers as any).raw?.()["set-cookie"] ??
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
