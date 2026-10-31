import { NextResponse } from "next/server";
import { abuseProxyHeaders, backendResponseInit } from "@/lib/abuseProxy";

export async function POST(req: Request) {
  const { email } = await req.json();
  const cookie = req.headers.get("cookie") || "";

  try {
    const path = "/api/subscribe";
    const res = await fetch(`${process.env.API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie, ...abuseProxyHeaders(req, path) },
      body: JSON.stringify({ email }),
      credentials: "include",
    });

    const data = await res.json();
    return NextResponse.json(data, backendResponseInit(res));
  } catch (err) {
    console.error("❌ Error proxying subscribe:", err);
    return NextResponse.json(
      { status: "error", message: "Subscription failed" },
      { status: 500 }
    );
  }
}
