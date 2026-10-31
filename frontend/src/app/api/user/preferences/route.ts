import { NextResponse } from "next/server";
import { mutationProxyHeaders } from "@/lib/abuseProxy";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const res = await fetch(`${API_BASE_URL}/user/preferences`, {
    method: "GET",
    headers: { Cookie: cookie },
    credentials: "include",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const body = await req.json();
  const backendPath = "/user/preferences";
  const res = await fetch(`${API_BASE_URL}${backendPath}`, {
    method: "PATCH",
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
