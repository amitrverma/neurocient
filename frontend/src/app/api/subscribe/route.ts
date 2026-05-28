import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();
  const cookie = req.headers.get("cookie") || "";

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ email }),
      credentials: "include",
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("❌ Error proxying subscribe:", err);
    return NextResponse.json(
      { status: "error", message: "Subscription failed" },
      { status: 500 }
    );
  }
}
