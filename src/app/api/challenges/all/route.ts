import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/challenges/all`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Error proxying /challenges/all:", err);
    return NextResponse.json(
      { detail: "Failed to fetch all challenges" },
      { status: 500 }
    );
  }
}
