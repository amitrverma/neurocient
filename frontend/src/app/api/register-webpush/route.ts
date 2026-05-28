import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json(); // contains { endpoint, keys }

  const res = await fetch(`${API_BASE_URL}/api/register-webpush`, {
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
