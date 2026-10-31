import { NextResponse } from "next/server";
import { abuseProxyHeaders, backendResponseInit } from "@/lib/abuseProxy";

export async function POST(request: Request) {
  const path = "/api/contact";
  try {
    const response = await fetch(`${process.env.API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...abuseProxyHeaders(request, path) },
      body: JSON.stringify(await request.json()),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, backendResponseInit(response));
  } catch {
    return NextResponse.json({ error: "Contact service is unavailable" }, { status: 503 });
  }
}
