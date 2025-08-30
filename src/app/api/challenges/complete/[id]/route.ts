import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const token = req.headers.get("authorization");
  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(`${API_BASE_URL}/challenges/assign/${id}`, {
    method: "POST",
    headers: { Authorization: token },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
