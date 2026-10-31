import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { GUEST_ACCESS_COOKIE, proxy } from "./proxy";

describe("Insight guest identity proxy", () => {
  it("sets a durable HttpOnly identity when one is absent", () => {
    const request = new NextRequest(
      "https://neurocient.test/insights/doomscrolling",
    );
    const response = proxy(request);
    const cookie = response.cookies.get(GUEST_ACCESS_COOKIE);

    expect(request.cookies.get(GUEST_ACCESS_COOKIE)?.value).toBe(cookie?.value);
    expect(cookie?.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=lax");
  });

  it("does not replace an existing identity", () => {
    const existingId = "2ea938b8-211d-4e4a-bf27-f732f127cb62";
    const request = new NextRequest(
      "https://neurocient.test/insights/doomscrolling",
      { headers: { cookie: `${GUEST_ACCESS_COOKIE}=${existingId}` } },
    );
    const response = proxy(request);

    expect(response.cookies.get(GUEST_ACCESS_COOKIE)).toBeUndefined();
  });

  it("repairs an invalid identity instead of leaving Insights inaccessible", () => {
    const request = new NextRequest(
      "https://neurocient.test/insights/doomscrolling",
      { headers: { cookie: `${GUEST_ACCESS_COOKIE}=invalid` } },
    );
    const response = proxy(request);

    expect(response.cookies.get(GUEST_ACCESS_COOKIE)?.value).toMatch(
      /^[0-9a-f-]{36}$/,
    );
    expect(request.cookies.get(GUEST_ACCESS_COOKIE)?.value).not.toBe("invalid");
  });
});
