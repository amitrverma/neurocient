import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch(`${process.env.API_BASE_URL}/articles/top`, {
      headers: {
        "Content-Type": "application/json",
      },
      // 👇 ensures Next.js doesn’t cache the response
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Error proxying /articles/top:", err);
    return NextResponse.json(
      { detail: "Failed to fetch top articles" },
      { status: 500 }
    );
  }
}
