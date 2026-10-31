import { NextResponse, type NextRequest } from "next/server";

export const GUEST_ACCESS_COOKIE = "guest_access_id";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function exactOrigin(value: string | null, expected: string, referer: boolean) {
  if (!value || value === "null" || value.includes(",")) return false;
  try {
    const parsed = new URL(value);
    if (parsed.username || parsed.password) return false;
    if (!referer && value !== parsed.origin) return false;
    return parsed.origin === expected;
  } catch {
    return false;
  }
}

function csrfFailure() {
  return NextResponse.json(
    { detail: { code: "csrf_failed" } },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}

export function proxy(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith("/api/") &&
    UNSAFE_METHODS.has(request.method)
  ) {
    const expected = request.nextUrl.origin;
    const origin = request.headers.get("origin");
    const trusted = origin !== null
      ? exactOrigin(origin, expected, false)
      : exactOrigin(request.headers.get("referer"), expected, true);
    if (!trusted) return csrfFailure();
  }

  if (!request.nextUrl.pathname.startsWith("/insights/")) {
    return NextResponse.next();
  }

  const existingGuestId = request.cookies.get(GUEST_ACCESS_COOKIE)?.value;
  if (existingGuestId && UUID_PATTERN.test(existingGuestId)) {
    return NextResponse.next();
  }

  const guestId = crypto.randomUUID();
  request.cookies.set(GUEST_ACCESS_COOKIE, guestId);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", request.cookies.toString());
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.cookies.set({
    name: GUEST_ACCESS_COOKIE,
    value: guestId,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}

export const config = {
  matcher: ["/insights/:path*", "/api/:path*"],
};
