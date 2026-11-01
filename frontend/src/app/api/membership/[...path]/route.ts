import { NextResponse } from "next/server";
import { abuseProxyHeaders, backendResponseInit } from "@/lib/abuseProxy";

async function proxy(
  req: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const backendPath = `/api/membership/${path.join("/")}`;
  const response = await fetch(`${process.env.API_BASE_URL}${backendPath}`, {
    method: req.method,
    headers: {
      Cookie: req.headers.get("cookie") || "",
      ...(req.method === "GET"
        ? {}
        : abuseProxyHeaders(req, backendPath)),
    },
    cache: "no-store",
  });
  return NextResponse.json(
    await response.json().catch(() => ({})),
    backendResponseInit(response),
  );
}

export const GET = proxy;
export const POST = proxy;
