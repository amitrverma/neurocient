import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const token = req.headers.get("authorization");

  const res = await fetch(`${API_BASE_URL}/challenges/${params.id}`, {
    headers: token ? { Authorization: token } : {},
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
