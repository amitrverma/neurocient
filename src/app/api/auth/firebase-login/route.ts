import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📨 [Proxy] Received token:", body.idToken?.slice(0, 30), "...", body.idToken?.length);

    const res = await fetch(`${process.env.API_BASE_URL}/auth/firebase-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("🔥 Error in firebase-login proxy:", err);
    return NextResponse.json({ error: "Proxy failed" }, { status: 500 });
  }
}