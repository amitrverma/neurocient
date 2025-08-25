import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      // You can also forward cookies/auth headers if needed
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
