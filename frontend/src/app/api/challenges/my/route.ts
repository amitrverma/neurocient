import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

// ✅ GET /api/challenges/my → list user’s challenges
export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const res = await fetch(`${API_BASE_URL}/challenges/my`, {
      method: "GET",
      headers: {
        Cookie: cookie, // 👈 forward cookies
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("❌ Error in GET /api/challenges/my:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
