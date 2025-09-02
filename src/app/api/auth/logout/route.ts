import { NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

export async function POST(req: Request) {
  try {
    const cookie = req.headers.get("cookie") || "";

    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Cookie: cookie },
    });

    const data = await res.json();

    // Build JSON response and forward Set-Cookie headers (clear tokens)
    const response = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    // Optional redirect mode
    const url = new URL(req.url);
    if (url.searchParams.get("redirect")) {
      return NextResponse.redirect(new URL("/", req.url), {
        status: 303,
        headers: response.headers,
      });
    }

    return response;
  } catch (err) {
    console.error("❌ Error in POST auth/logout:", err);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
