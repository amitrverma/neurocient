import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

// GET /api/usage -> fetch current usage counts
export async function GET(req: Request) {
  const token = req.headers.get("authorization") || "";
  const res = await fetch(`${API_BASE_URL}/usage`, {
    headers: { Authorization: token },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST /api/usage -> record a usage event
export async function POST(req: Request) {
  const token = req.headers.get("authorization") || "";
  const body = await req.json();
  const res = await fetch(`${API_BASE_URL}/usage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
