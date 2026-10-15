import { NextResponse } from "next/server";

async function proxy(req: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const body = req.method === "GET" ? undefined : await req.text();
  const res = await fetch(`${process.env.API_BASE_URL}/api/cohorts/${path.join("/")}`, {
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
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
