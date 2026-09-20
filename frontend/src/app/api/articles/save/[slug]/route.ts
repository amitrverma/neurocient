import { NextResponse } from "next/server";

type SaveBody = Record<string, unknown>;

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const cookie = req.headers.get("cookie") || "";

  let body: SaveBody = {};
  try {
    body = (await req.json()) as SaveBody;
  } catch {
    body = {} as SaveBody;
  }

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/articles/save/${slug}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      credentials: "include",
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
  const cookie = req.headers.get("cookie") || "";

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/articles/save/${slug}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
      },
      credentials: "include",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("❌ Error proxying DELETE /articles/save/[slug]:", err);
    return NextResponse.json({ detail: "Unsave failed" }, { status: 500 });
  }
}
