import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST(request: Request) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/caveman-scan/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: request.headers.get("cookie") || "" },
      body: JSON.stringify(await request.json()),
    });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch {
    return NextResponse.json({ detail: "Could not start the scan." }, { status: 500 });
  }
}
