// app/api/nudges/random/route.ts
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(req: Request) {
  try {
    // get cookies from incoming request
    const cookie = req.headers.get("cookie") || "";

    // forward them to FastAPI
    const res = await fetch(`${API_BASE_URL}/api/nudges/random`, {
      method: "GET",
      headers: {
        Cookie: cookie,
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Error in GET /api/nudges/random:", err);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
