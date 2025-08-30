import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }   // 👈 match RouteHandlerConfig
) {
  const { id } = await context.params;          // 👈 await since it's a Promise
  const token = request.headers.get("authorization");

  const res = await fetch(`${API_BASE_URL}/challenges/${id}`, {
    headers: token ? { Authorization: token } : {},
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
