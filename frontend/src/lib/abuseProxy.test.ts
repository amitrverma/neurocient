import { afterEach, describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { abuseProxyHeaders } from "./abuseProxy";

describe("abuse proxy identity", () => {
  const originalSecret = process.env.ABUSE_PROXY_SECRET;
  const originalVercelEnv = process.env.VERCEL_ENV;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.ABUSE_PROXY_SECRET;
    else process.env.ABUSE_PROXY_SECRET = originalSecret;
    if (originalVercelEnv === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = originalVercelEnv;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
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

  it("fails closed in a non-Vercel production runtime", () => {
    delete process.env.ABUSE_PROXY_SECRET;
    delete process.env.VERCEL_ENV;
    process.env.NODE_ENV = "production";
    expect(() => abuseProxyHeaders(
      new Request("https://site.test/api/contact", { method: "POST" }),
      "/api/contact",
    )).toThrow("Protected proxy is unavailable");
  });

  it("forwards the local request origin when development has no shared secret", () => {
    delete process.env.ABUSE_PROXY_SECRET;
    delete process.env.VERCEL_ENV;
    expect(
      abuseProxyHeaders(
        new Request("http://localhost:3000/api/auth/logout", { method: "POST" }),
        "/auth/logout",
      ),
    ).toEqual({ Origin: "http://localhost:3000" });
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

  it("can sign an explicit outbound method for a mutation hidden behind a page GET", () => {
    const secret = "test-secret-that-is-at-least-32-characters";
    process.env.ABUSE_PROXY_SECRET = secret;
    const headers = abuseProxyHeaders(
      new Request("https://site.test/insights/example", {
        method: "GET",
        headers: { "x-vercel-forwarded-for": "203.0.113.7" },
      }),
      "/articles/example/access",
      1_700_000_000,
      "POST",
    );
    expect(headers["X-Neurocient-Proxy-Signature"]).toBe(
      createHmac("sha256", secret)
        .update("1700000000\nPOST\n/articles/example/access\n203.0.113.7")
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

  it("signs every frontend-to-backend unsafe proxy, including alias exports", () => {
    const apiRoot = resolve(process.cwd(), "src/app/api");
    const routes = readdirSync(apiRoot, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile() && /^route\.tsx?$/.test(entry.name))
      .map((entry) => resolve(entry.parentPath, entry.name));
    const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
    const helperCall = /(?:abuseProxyHeaders|mutationProxyHeaders)\s*\(/;
    for (const route of routes) {
      const source = readFileSync(route, "utf8");
      const namedHandlers = [...source.matchAll(
        /export\s+async\s+function\s+(GET|HEAD|OPTIONS|POST|PUT|PATCH|DELETE)\b/g,
      )];
      for (const [index, handler] of namedHandlers.entries()) {
        if (!unsafeMethods.has(handler[1])) continue;
        const nextStart = namedHandlers[index + 1]?.index ?? source.length;
        const handlerSource = source.slice(handler.index, nextStart);
        if (!helperCall.test(handlerSource)) {
          const delegate = handlerSource.match(/return\s+await\s+(\w+)\s*\(/)?.[1];
          expect(delegate, `${route}:${handler[1]} delegate`).toBeTruthy();
          const delegateStart = source.search(
            new RegExp(`const\\s+${delegate}\\s*=\\s*async\\b`),
          );
          expect(delegateStart, `${route}:${handler[1]} delegate target`).toBeGreaterThanOrEqual(0);
          const delegateEnd = namedHandlers[0]?.index ?? source.length;
          const delegateSource = source.slice(delegateStart, delegateEnd);
          expect(delegateSource, `${route}:${handler[1]} delegate signing`).toMatch(helperCall);
          expect(handlerSource, `${route}:${handler[1]} method binding`).toContain(
            `"${handler[1]}"`,
          );
        }
      }

      const unsafeAliases = [...source.matchAll(
        /export\s+const\s+(POST|PUT|PATCH|DELETE)\s*=\s*(\w+)\s*;/g,
      )];
      for (const alias of unsafeAliases) {
        const handlerName = alias[2];
        const handlerStart = source.search(
          new RegExp(`async\\s+function\\s+${handlerName}\\b|const\\s+${handlerName}\\s*=`),
        );
        expect(handlerStart, `${route}:${alias[1]} alias target`).toBeGreaterThanOrEqual(0);
        const handlerSource = source.slice(handlerStart, alias.index);
        expect(handlerSource, `${route}:${alias[1]}`).toMatch(helperCall);
        expect(handlerSource, `${route}:${alias[1]} method coverage`).toMatch(
          /req\.method\s*===\s*["']GET["']\s*\?\s*\{\}\s*:/,
        );
      }
    }

    const appRoot = resolve(process.cwd(), "src/app");
    const nonApiSources = readdirSync(appRoot, { recursive: true, withFileTypes: true })
      .filter((entry) =>
        entry.isFile() &&
        /\.(?:ts|tsx)$/.test(entry.name) &&
        !/\.test\.(?:ts|tsx)$/.test(entry.name) &&
        !entry.parentPath.includes(`${resolve(appRoot, "api")}`),
      )
      .map((entry) => resolve(entry.parentPath, entry.name));
    const serverMutations = nonApiSources.filter((file) => {
      const source = readFileSync(file, "utf8");
      return source.includes("process.env.API_BASE_URL") &&
        /method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/.test(source);
    });
    expect(serverMutations.map((file) => file.replace(`${process.cwd()}\\`, ""))).toEqual([
      expect.stringMatching(/src[\\/]app[\\/]insights[\\/]\[slug\][\\/]articleAccess\.ts$/),
    ]);
    for (const file of serverMutations) {
      const source = readFileSync(file, "utf8");
      const unsafeCalls = source.match(
        /method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/g,
      )?.length ?? 0;
      const signedCalls = source.match(
        /(?:abuseProxyHeaders|mutationProxyHeaders)\s*\(/g,
      )?.length ?? 0;
      expect(signedCalls, file).toBeGreaterThanOrEqual(unsafeCalls);
      expect(source, file).toContain('fetchSite === "same-origin" || fetchSite === "none"');
    }
  });
});
