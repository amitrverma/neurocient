import { NextResponse } from "next/server";

// make sure it's defined, or fallback to localhost for dev
const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000";

// ⬇️ prevent Next from trying to prerender this at build time
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/challenges`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store", // always fresh
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch challenges" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("API /challenges fetch failed:", err);
    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 500 }
    );
  }
}
