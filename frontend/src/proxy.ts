import { NextResponse, type NextRequest } from "next/server";

export const GUEST_ACCESS_COOKIE = "guest_access_id";
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function proxy(request: NextRequest) {
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
  matcher: "/insights/:path*",
};
