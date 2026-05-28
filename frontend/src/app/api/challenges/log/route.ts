import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

// ✅ POST /api/challenges/log → log progress for a challenge
export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const body = await req.json();

    const res = await fetch(`${API_BASE_URL}/challenges/log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie, // forward auth cookie
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("❌ Error in POST /api/challenges/log:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
