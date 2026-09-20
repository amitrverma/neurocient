import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const response = await fetch(`${API_BASE_URL}/api/caveman-scan/sessions/${id}/link`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: request.headers.get("cookie") || "" },
      body: JSON.stringify(await request.json()),
    });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch {
    return NextResponse.json({ detail: "Could not keep this portrait." }, { status: 500 });
  }
}
