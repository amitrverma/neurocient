import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params; // ✅ await params

    const res = await fetch(
      `${process.env.API_BASE_URL}/articles/${slug}/read`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Error proxying /articles/[slug]/read:", err);
    return NextResponse.json(
      { detail: "Failed to increment read count" },
      { status: 500 }
    );
  }
}
