import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }   // 👈 plain object, not Promise
) {
  const { id } = params;                   // ✅ no await needed
  const cookie = request.headers.get("cookie") || "";

  try {
    const res = await fetch(`${API_BASE_URL}/challenges/${id}`, {
      method: "GET",
      headers: { Cookie: cookie },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Error in GET /api/challenges/[id]:", err);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
