import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

describe("contact backend proxy", () => {
  const originalFetch = global.fetch;
  const originalApi = process.env.API_BASE_URL;
  const originalSecret = process.env.ABUSE_PROXY_SECRET;

  beforeEach(() => {
    process.env.API_BASE_URL = "https://backend.example";
    process.env.ABUSE_PROXY_SECRET = "a".repeat(32);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 202 }),
    ));
  });

  afterEach(() => {
    vi.stubGlobal("fetch", originalFetch);
    if (originalApi === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = originalApi;
    if (originalSecret === undefined) delete process.env.ABUSE_PROXY_SECRET;
    else process.env.ABUSE_PROXY_SECRET = originalSecret;
  });

  it("forwards contact to FastAPI with a signed client identity", async () => {
    const response = await POST(new Request("https://neurocient.test/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-vercel-forwarded-for": "203.0.113.7",
      },
      body: JSON.stringify({ name: "Amit", email: "amit@example.com", message: "Hello" }),
    }));

    expect(response.status).toBe(202);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://backend.example/api/contact",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Neurocient-Client-IP": "203.0.113.7",
          "X-Neurocient-Proxy-Signature": expect.stringMatching(/^[a-f0-9]{64}$/),
        }),
      }),
    );
  });

  it("preserves the stable rate-limit body and recovery headers", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(
      JSON.stringify({ detail: { code: "rate_limited", retry_after: 42 } }),
      { status: 429, headers: { "Retry-After": "42", "Cache-Control": "no-store" } },
    ));
    const response = await POST(new Request("https://neurocient.test/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-vercel-forwarded-for": "203.0.113.7" },
      body: JSON.stringify({ name: "Amit", email: "amit@example.com", message: "Hello" }),
    }));
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("42");
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      detail: { code: "rate_limited", retry_after: 42 },
    });
  });
});
