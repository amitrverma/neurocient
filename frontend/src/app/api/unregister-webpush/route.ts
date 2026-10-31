import { NextResponse } from "next/server";
import { mutationProxyHeaders } from "@/lib/abuseProxy";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function POST(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const backendPath = "/api/unregister-webpush";

  const res = await fetch(`${API_BASE_URL}${backendPath}`, {
    method: "POST",
    headers: {
      ...mutationProxyHeaders(req, backendPath),
      Cookie: cookie,
    },
    credentials: "include",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
