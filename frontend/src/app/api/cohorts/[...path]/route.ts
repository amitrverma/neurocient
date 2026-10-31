import { NextResponse } from "next/server";
import { abuseProxyHeaders, backendResponseInit } from "@/lib/abuseProxy";

async function proxy(req: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const body = req.method === "GET" ? undefined : await req.text();
  const backendPath = `/api/cohorts/${path.join("/")}`;
  const res = await fetch(`${process.env.API_BASE_URL}${backendPath}`, {
    method: req.method,
    headers: {
      Cookie: req.headers.get("cookie") || "",
      ...(body ? { "Content-Type": req.headers.get("content-type") || "application/json" } : {}),
      ...(req.method === "GET" ? {} : abuseProxyHeaders(req, backendPath)),
    },
    body,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, backendResponseInit(res));
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
