import { NextResponse } from "next/server";
import {
  abuseProxyHeaders,
  backendResponseInit,
  correlationHeaders,
} from "@/lib/abuseProxy";

async function proxy(
  req: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const body = req.method === "GET" ? undefined : await req.text();
  const backendPath = `/api/membership/${path.join("/")}`;
  const response = await fetch(`${process.env.API_BASE_URL}${backendPath}`, {
    method: req.method,
    headers: {
      Cookie: req.headers.get("cookie") || "",
      ...correlationHeaders(req),
      ...(body
        ? { "Content-Type": req.headers.get("content-type") || "application/json" }
        : {}),
      ...(req.method === "GET"
        ? {}
        : abuseProxyHeaders(req, backendPath)),
    },
    body,
    cache: "no-store",
  });
  return NextResponse.json(
    await response.json().catch(() => ({})),
    backendResponseInit(response),
  );
}

export const GET = proxy;
export const POST = proxy;
