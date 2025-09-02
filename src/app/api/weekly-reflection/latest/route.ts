import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(req: Request) {
  try {
    // 1. Get cookies from the incoming client request
    const cookie = req.headers.get("cookie") || "";

    // 2. Forward them to FastAPI
    const res = await fetch(`${API_BASE_URL}/api/weekly-reflection/latest`, {
      method: "GET",
      headers: {
        Cookie: cookie, // 👈 explicitly forward cookies
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Error in GET /api/weekly-reflection/latest:", err);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
