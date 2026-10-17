import { NextResponse } from "next/server";

async function proxy(req: Request, context: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await context.params;
    const body = req.method === "GET" ? undefined : await req.text();
    const search = new URL(req.url).search;
    const res = await fetch(`${process.env.API_BASE_URL}/api/admin/${path.join("/")}${search}`, {
      method: req.method,
      headers: {
        Cookie: req.headers.get("cookie") || "",
        ...(body ? { "Content-Type": req.headers.get("content-type") || "application/json" } : {}),
      },
      body,
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error("Admin API proxy failed:", error);
    return NextResponse.json({ detail: "Admin service unavailable" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
