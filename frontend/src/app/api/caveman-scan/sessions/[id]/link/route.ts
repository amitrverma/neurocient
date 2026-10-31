import { NextResponse } from "next/server";
import { mutationProxyHeaders } from "@/lib/abuseProxy";

const API_BASE_URL = process.env.API_BASE_URL;
type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { id } = await context.params;
    const backendPath = `/api/caveman-scan/sessions/${id}/link`;
    const response = await fetch(`${API_BASE_URL}${backendPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: request.headers.get("cookie") || "", ...mutationProxyHeaders(request, backendPath) },
      body: JSON.stringify(await request.json()),
    });
    return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
  } catch {
    return NextResponse.json({ detail: "Could not keep this portrait." }, { status: 500 });
  }
}
