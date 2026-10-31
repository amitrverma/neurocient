import { NextRequest, NextResponse } from "next/server";
import { mutationProxyHeaders } from "@/lib/abuseProxy";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const cookie = req.headers.get("cookie") || "";
  const backendPath = `/challenges/assign/${id}`;

  const res = await fetch(`${API_BASE_URL}${backendPath}`, {
    method: "POST",
    headers: { Cookie: cookie, ...mutationProxyHeaders(req, backendPath) },
    credentials: "include",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
