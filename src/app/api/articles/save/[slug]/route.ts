import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const token = req.headers.get("authorization");

  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/articles/save/${slug}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Error proxying POST /articles/save/[slug]:", err);
    return NextResponse.json({ detail: "Save failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const token = req.headers.get("authorization");

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/articles/save/${slug}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Error proxying DELETE /articles/save/[slug]:", err);
    return NextResponse.json({ detail: "Unsave failed" }, { status: 500 });
  }
}
