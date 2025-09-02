// app/api/weekly-reflection/latest/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // 1. Get cookies from the incoming client request
  const cookie = req.headers.get("cookie") || "";

  // 2. Forward them to FastAPI
  const res = await fetch(`${process.env.API_BASE_URL}/api/weekly-reflection/latest`, {
    method: "GET",
    headers: { Cookie: cookie },
    credentials: "include", // 👈 this will forward cookies
  });


  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
