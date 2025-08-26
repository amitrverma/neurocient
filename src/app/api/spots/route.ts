import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

// GET /api/spots → list spots
export async function GET(req: Request) {
  const token = req.headers.get("authorization");

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/spots`, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json"
      },
    });

    const data = await res.json();

    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("❌ Error in GET route:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// POST /api/spots → create a new spot
export async function POST(req: Request) {
  const token = req.headers.get("authorization");

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // ✅ FIXED: Frontend already sends { description, date }, so pass it through directly
  const payload = {
    description: body.description,  // ✅ Frontend sends description, not note

  };

  const res = await fetch(`${API_BASE_URL}/api/spots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
