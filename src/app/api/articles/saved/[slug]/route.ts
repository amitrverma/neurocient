import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = req.headers.get("authorization");

  if (!token) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  // Proxy to backend
  const res = await fetch(`${process.env.API_BASE_URL}/articles/saved/${slug}`, {
    headers: { Authorization: token },
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
