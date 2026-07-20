import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

// ✅ GET /api/spots/ → list spots
export async function GET(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const res = await fetch(`${API_BASE_URL}/api/spots/`, {
      method: "GET",
      headers: {
        Cookie: cookie, // 👈 forward cookies
      },
      credentials: "include",
    });

    const data = await res.json();
    const cleaned = Array.isArray(data)
      ? data.map((spot) => {
          const description = typeof spot.description === "string" ? spot.description : "";
          const match = description.match(/^\[caveman-pattern:([^\]]+)\]\n?/);
          return {
            ...spot,
            pattern: match?.[1] ?? null,
            description: description.replace(/^\[caveman-pattern:[^\]]+\]\n?/, ""),
          };
        })
      : data;
    return NextResponse.json(cleaned, { status: res.status });
  } catch (error) {
    console.error("❌ Error in GET /api/spots/:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}

// ✅ POST /api/spots/ → create a new spot
export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const body = await req.json();

    const payload = {
      description: body.description, // ✅ consistent with frontend
    };

    const res = await fetch(`${API_BASE_URL}/api/spots/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie, // 👈 forward cookies
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("❌ Error in POST /api/spots/:", error);
    return NextResponse.json({ detail: "Internal server error" }, { status: 500 });
  }
}
