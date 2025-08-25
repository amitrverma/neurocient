import { NextResponse } from "next/server";

async function parseResponse(res: Response) {
  const text = await res.text(); // ✅ read once
  try {
    return JSON.parse(text);
  } catch {
    return { detail: text }; // fallback if not JSON
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = req.headers.get("authorization");
  const body = await req.json();

  const res = await fetch(`${process.env.API_BASE_URL}/articles/save/${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
    body: JSON.stringify(body),
  });

  const data = await parseResponse(res);
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const token = req.headers.get("authorization");

  const res = await fetch(`${process.env.API_BASE_URL}/articles/save/${slug}`, {
    method: "DELETE",
    headers: {
      Authorization: token || "",
    },
  });

  const data = await parseResponse(res);
  return NextResponse.json(data, { status: res.status });
}
