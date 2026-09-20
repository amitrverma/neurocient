import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

// GET /api/usage -> fetch current usage counts
export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${API_BASE_URL}/usage`, {
    method: "GET",
    headers: { Cookie: cookie },
    credentials: "include",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST /api/usage -> record a usage event
export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json();
  const res = await fetch(`${API_BASE_URL}/usage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookie,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
