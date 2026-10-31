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

describe("API mutation origin protection", () => {
  it.each(["POST", "PUT", "PATCH", "DELETE"])(
    "accepts a same-origin %s request",
    (method) => {
      const request = new NextRequest("https://www.neurocient.com/api/private", {
        method,
        headers: { Origin: "https://www.neurocient.com" },
      });
      expect(proxy(request).status).toBe(200);
    },
  );

  it("accepts an exact-origin Referer fallback", () => {
    const request = new NextRequest("https://www.neurocient.com/api/private", {
      method: "POST",
      headers: { Referer: "https://www.neurocient.com/profile?tab=privacy" },
    });
    expect(proxy(request).status).toBe(200);
  });

  it.each([
    {},
    { Origin: "null" },
    { Origin: "not a url" },
    { Origin: "https://evil.example" },
    { Origin: "http://www.neurocient.com" },
    { Origin: "https://www.neurocient.com:444" },
    { Origin: "https://www.neurocient.com.evil.example" },
    { Referer: "https://www.neurocient.com.evil.example/profile" },
  ])("rejects a JSON mutation with untrusted evidence %#", async (headers) => {
    const request = new NextRequest("https://www.neurocient.com/api/private", {
      method: "POST",
      headers,
      body: JSON.stringify({ private: true }),
    });
    const response = proxy(request);
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      detail: { code: "csrf_failed" },
    });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects a cross-origin no-body mutation", () => {
    const request = new NextRequest("https://www.neurocient.com/api/logout", {
      method: "POST",
      headers: { Origin: "https://evil.example" },
    });
    expect(proxy(request).status).toBe(403);
  });

  it.each(["GET", "HEAD", "OPTIONS"])("does not block safe %s", (method) => {
    const request = new NextRequest("https://www.neurocient.com/api/public", {
      method,
      headers: { Origin: "https://evil.example" },
    });
    expect(proxy(request).status).toBe(200);
  });
});
