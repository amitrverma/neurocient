import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const body = await req.text();
    const response = await fetch(`${API_BASE_URL}/api/weekly-reflection`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: cookie },
      body,
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error saving reflection:", error);
    return NextResponse.json(
      { detail: "Could not save your reflection." },
      { status: 500 },
    );
  }
}
