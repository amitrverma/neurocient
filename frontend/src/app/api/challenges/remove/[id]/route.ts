import { NextRequest, NextResponse } from "next/server";
import { mutationProxyHeaders } from "@/lib/abuseProxy";

const API_BASE_URL = process.env.API_BASE_URL;

// ✅ POST /api/challenges/remove/:id → remove an assigned challenge
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const { id } = await params;
    const backendPath = `/challenges/remove/${id}`;

    const res = await fetch(`${API_BASE_URL}${backendPath}`, {
      method: "POST",
      headers: {
        ...mutationProxyHeaders(req, backendPath),
        Cookie: cookie, // 👈 forward cookies for auth
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error(`❌ Error in POST /api/challenges/remove/:id:`, error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
