import { NextResponse } from "next/server";
import { abuseProxyHeaders, backendResponseInit } from "@/lib/abuseProxy";

export async function POST(request: Request) {
  const apiBaseUrl = process.env.API_BASE_URL;
  if (!apiBaseUrl) {
    return NextResponse.json(
      { detail: "Password recovery is temporarily unavailable." },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const path = "/auth/password-reset/request";
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Neurocient-Auth-Request": "browser-bff",
        ...abuseProxyHeaders(request, path),
      },
      body: JSON.stringify(body),
      cache: "no-store",
      redirect: "manual",
    });
    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, backendResponseInit(response));
  } catch {
    return NextResponse.json(
      { detail: "Password recovery is temporarily unavailable." },
      { status: 503 },
    );
  }
}
