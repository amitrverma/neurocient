import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(request: Request) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/caveman-scan/sessions/latest`, {
      method: "GET",
      headers: { Cookie: request.headers.get("cookie") || "" },
      cache: "no-store",
    });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch {
    return NextResponse.json({ detail: "Could not load your portrait." }, { status: 500 });
  }
}
