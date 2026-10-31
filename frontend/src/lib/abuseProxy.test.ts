import { afterEach, describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { abuseProxyHeaders } from "./abuseProxy";

describe("abuse proxy identity", () => {
  const originalSecret = process.env.ABUSE_PROXY_SECRET;
  const originalVercelEnv = process.env.VERCEL_ENV;

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.ABUSE_PROXY_SECRET;
    else process.env.ABUSE_PROXY_SECRET = originalSecret;
    if (originalVercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = originalVercelEnv;
  });

  it("matches the backend signature contract and trusts Vercel's canonical header", () => {
    const secret = "test-secret-that-is-at-least-32-characters";
    process.env.ABUSE_PROXY_SECRET = secret;
    const headers = abuseProxyHeaders(new Request("https://site.test/api/auth/login", {
      method: "POST",
      headers: {
        "x-vercel-forwarded-for": "2001:db8::1",
        "x-forwarded-for": "198.51.100.10, 10.0.0.1",
      },
    }), "/auth/login", 1_700_000_000);
    const expected = createHmac("sha256", secret)
      .update("1700000000\nPOST\n/auth/login\n2001:db8::1")
      .digest("hex");
    expect(headers).toEqual({
      "X-Neurocient-Client-IP": "2001:db8::1",
      "X-Neurocient-Proxy-Timestamp": "1700000000",
      "X-Neurocient-Proxy-Signature": expected,
    });
  });

  it("fails closed in Vercel production when the secret is missing", () => {
    delete process.env.ABUSE_PROXY_SECRET;
    process.env.VERCEL_ENV = "production";
    expect(() => abuseProxyHeaders(
      new Request("https://site.test/api/contact", { method: "POST" }),
      "/api/contact",
    )).toThrow("Protected proxy is unavailable");
  });

  it("also fails closed in a Vercel preview", () => {
    delete process.env.ABUSE_PROXY_SECRET;
    process.env.VERCEL_ENV = "preview";
    expect(() => abuseProxyHeaders(
      new Request("https://preview.test/api/contact", { method: "POST" }),
      "/api/contact",
    )).toThrow("Protected proxy is unavailable");
  });

  it("signs expanded IPv6 text exactly for backend verification", () => {
    const secret = "test-secret-that-is-at-least-32-characters";
    process.env.ABUSE_PROXY_SECRET = secret;
    const expanded = "2001:0DB8:0000:0000:0000:0000:0000:0001";
    const headers = abuseProxyHeaders(new Request("https://site.test/api/contact", {
      method: "POST",
      headers: { "x-vercel-forwarded-for": expanded },
    }), "/api/contact", 1_700_000_000);
    expect(headers["X-Neurocient-Client-IP"]).toBe(expanded);
    expect(headers["X-Neurocient-Proxy-Signature"]).toBe(
      createHmac("sha256", secret)
        .update(`1700000000\nPOST\n/api/contact\n${expanded}`)
        .digest("hex"),
    );
  });

  it("is wired into every protected Vercel mutation proxy", () => {
    const routes = [
      "src/app/api/auth/login/route.ts",
      "src/app/api/auth/signup/route.ts",
      "src/app/api/auth/refresh/route.tsx",
      "src/app/api/auth/firebase-login/route.ts",
      "src/app/api/auth/password-reset/request/route.ts",
      "src/app/api/auth/password-reset/confirm/route.ts",
      "src/app/api/caveman-scan/sessions/route.ts",
      "src/app/api/subscribe/route.ts",
      "src/app/api/contact/route.ts",
      "src/app/api/cohorts/[...path]/route.ts",
    ];
    for (const route of routes) {
      const source = readFileSync(resolve(process.cwd(), route), "utf8");
      expect(source, route).toContain("abuseProxyHeaders");
      expect(source, route).toContain("backendResponseInit");
    }
  });
});
