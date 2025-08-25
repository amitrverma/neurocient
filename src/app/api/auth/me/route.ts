import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const token = req.headers.get("authorization");

  const res = await fetch(`${process.env.API_BASE_URL}/auth/me`, {
    headers: { Authorization: token || "" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
