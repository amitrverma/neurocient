import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as requestReset } from "./request/route";
import { POST as confirmReset } from "./confirm/route";

describe("password reset API boundary", () => {
  const originalApiBaseUrl = process.env.API_BASE_URL;

  beforeEach(() => {
    process.env.API_BASE_URL = "https://backend.example";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalApiBaseUrl === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = originalApiBaseUrl;
  });

  it("marks reset requests as browser-BFF auth traffic", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 202,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await requestReset(
      new Request("https://neurocient.test/api/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email: "person@example.com" }),
      }),
    );

    expect(response.status).toBe(202);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example/auth/password-reset/request",
      expect.objectContaining({
        headers: expect.objectContaining({
          "X-Neurocient-Auth-Request": "browser-bff",
        }),
        cache: "no-store",
        redirect: "manual",
      }),
    );
  });

  it("forwards cookie clearing after a successful reset", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        status: 200,
        json: async () => ({ ok: true }),
        headers: {
          getSetCookie: () => [
            "access_token=; Path=/; Max-Age=0; HttpOnly",
            "refresh_token=; Path=/; Max-Age=0; HttpOnly",
          ],
        },
      }),
    );

    const response = await confirmReset(
      new Request("https://neurocient.test/api/auth/password-reset/confirm", {
        method: "POST",
        body: JSON.stringify({
          token: "a".repeat(43),
          password: "a secure new passphrase",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("access_token=");
    expect(response.headers.get("set-cookie")).toContain("refresh_token=");
  });

  it("fails safely when the backend is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const response = await requestReset(
      new Request("https://neurocient.test/api/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email: "person@example.com" }),
      }),
    );

    expect(response.status).toBe(503);
  });
});
