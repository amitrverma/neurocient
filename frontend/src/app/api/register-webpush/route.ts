import { NextResponse } from "next/server";
import { mutationProxyHeaders } from "@/lib/abuseProxy";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json(); // contains { endpoint, keys }
  const backendPath = "/api/register-webpush";

  const res = await fetch(`${API_BASE_URL}${backendPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...mutationProxyHeaders(req, backendPath),
      Cookie: cookie,
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
