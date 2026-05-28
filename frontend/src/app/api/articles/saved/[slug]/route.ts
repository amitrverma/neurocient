import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const cookie = req.headers.get("cookie") || "";

  // Proxy to backend
  const res = await fetch(`${process.env.API_BASE_URL}/articles/saved/${slug}`, {
    method: "GET",
    headers: { Cookie: cookie },
    credentials: "include",
  });

  let data: unknown;
  try {
    const text = await res.text();
    data = JSON.parse(text);
  } catch {
    data = { detail: "Unexpected response from backend" };
  }

  return NextResponse.json(data, { status: res.status });
}
