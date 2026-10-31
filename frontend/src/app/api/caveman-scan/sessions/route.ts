import { NextResponse } from "next/server";
import { abuseProxyHeaders, backendResponseInit } from "@/lib/abuseProxy";

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST(request: Request) {
  try {
    const path = "/api/caveman-scan/sessions";
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: request.headers.get("cookie") || "", ...abuseProxyHeaders(request, path) },
      body: JSON.stringify(await request.json()),
    });
    return NextResponse.json(await response.json().catch(() => ({})), backendResponseInit(response));
  } catch {
    return NextResponse.json({ detail: "Could not start the scan." }, { status: 500 });
  }
}
