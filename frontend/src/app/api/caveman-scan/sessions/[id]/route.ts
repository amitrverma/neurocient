import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;
type Context = { params: Promise<{ id: string }> };

const proxy = async (request: Request, id: string, method: "GET" | "PUT") => {
  const url = new URL(request.url);
  const suffix = method === "GET" ? `?${url.searchParams}` : "";
  const response = await fetch(`${API_BASE_URL}/api/caveman-scan/sessions/${id}${suffix}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: request.headers.get("cookie") || "" },
    body: method === "PUT" ? JSON.stringify(await request.json()) : undefined,
  });
  return NextResponse.json(await response.json().catch(() => ({})), { status: response.status });
};

export async function GET(request: Request, context: Context) {
  try { return await proxy(request, (await context.params).id, "GET"); }
  catch { return NextResponse.json({ detail: "Could not load the scan." }, { status: 500 }); }
}

export async function PUT(request: Request, context: Context) {
  try { return await proxy(request, (await context.params).id, "PUT"); }
  catch { return NextResponse.json({ detail: "Could not save the scan." }, { status: 500 }); }
}
