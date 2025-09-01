import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Forward Authorization header if present
  const token = req.headers.get("authorization");

  // Forward cookies from browser → backend
  const cookieHeader = req.headers.get("cookie") || "";

  const res = await fetch(`${process.env.API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: token } : {}),
      cookie: cookieHeader,
    },
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
