import { NextResponse } from "next/server";
import { backendResponseInit, mutationProxyHeaders } from "@/lib/abuseProxy";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function POST(req: Request) {
  const body = await req.json();
  const backendPath = "/user/preferences/whatsapp-verification/confirm";
  const response = await fetch(`${API_BASE_URL}${backendPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...mutationProxyHeaders(req, backendPath),
      Cookie: req.headers.get("cookie") || "",
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  return NextResponse.json(await response.json(), backendResponseInit(response));
}
