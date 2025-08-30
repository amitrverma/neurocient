import { NextResponse } from "next/server";

// 🚫 prevent build-time prerender
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/articles/top`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store", // always fetch fresh, never cache at build
    });

    if (!res.ok) {
      return NextResponse.json(
        { detail: "Failed to fetch top articles" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Error proxying /articles/top:", err);
    return NextResponse.json(
      { detail: "Backend unreachable" },
      { status: 500 }
    );
  }
}
