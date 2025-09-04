import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

// ✅ POST /api/challenges/remove/:id → remove an assigned challenge
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const res = await fetch(`${API_BASE_URL}/challenges/remove/${params.id}`, {
      method: "POST",
      headers: {
        Cookie: cookie, // 👈 forward cookies for auth
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`❌ Error in POST /api/challenges/remove/${params.id}:`, error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
