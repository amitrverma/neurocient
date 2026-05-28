import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";

  const res = await fetch(`${API_BASE_URL}/api/unregister-webpush`, {
    method: "POST",
    headers: {
      Cookie: cookie,
    },
    credentials: "include",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
