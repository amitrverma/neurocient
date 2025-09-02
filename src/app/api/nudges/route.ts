// app/api/nudges/random/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(`${process.env.API_BASE_URL}/api/nudges/random`, {
    credentials: "include",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
