import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${API_BASE_URL}/user/preferences`, {
    method: "GET",
    headers: { Cookie: cookie },
    credentials: "include",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json();
  const res = await fetch(`${API_BASE_URL}/user/preferences`, {
    method: "PATCH",
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
