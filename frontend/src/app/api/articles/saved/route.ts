import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  // Proxy to backend
  const res = await fetch(`${process.env.API_BASE_URL}/articles/saved`, {
    method: "GET",
    headers: { Cookie: cookie },
    credentials: "include",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
