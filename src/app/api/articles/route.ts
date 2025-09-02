// app/api/spots/route.ts
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

// ✅ GET /api/spots → fetch spots
export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${API_BASE_URL}/spots`, {
    method: "GET",
    headers: { Cookie: cookie },
    credentials: "include",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// ✅ POST /api/spots → create new spot
export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const body = await req.json();

  const res = await fetch(`${API_BASE_URL}/spots`, {
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
