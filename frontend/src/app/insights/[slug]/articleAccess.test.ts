import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));

import { cookies, headers } from "next/headers";
import { requestArticleAccess } from "./articleAccess";

describe("server-side Insight access", () => {
  const originalApiBaseUrl = process.env.API_BASE_URL;
  const originalProxySecret = process.env.ABUSE_PROXY_SECRET;

  beforeEach(() => {
    process.env.API_BASE_URL = "https://backend.example";
    process.env.ABUSE_PROXY_SECRET = "test-secret-that-is-at-least-32-characters";
    vi.mocked(cookies).mockResolvedValue({
      toString: () => "guest_access_id=guest; access_token=token",
    } as never);
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "sec-fetch-site": "same-origin" }) as never,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    if (originalApiBaseUrl === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = originalApiBaseUrl;
    if (originalProxySecret === undefined) delete process.env.ABUSE_PROXY_SECRET;
    else process.env.ABUSE_PROXY_SECRET = originalProxySecret;
  });

  it("forwards identity cookies to the authoritative backend", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ granted: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestArticleAccess("doomscrolling")).resolves.toEqual({
      granted: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example/articles/doomscrolling/access",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Cookie: "guest_access_id=guest; access_token=token",
          "X-Neurocient-Access-Request": "insight-page",
          "X-Neurocient-Proxy-Signature": expect.stringMatching(/^[a-f0-9]{64}$/),
        }),
        cache: "no-store",
        redirect: "manual",
      }),
    );
  });

  it("forwards an incoming Authorization header", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({
        Authorization: "Bearer account-token",
        "sec-fetch-site": "same-origin",
      }) as never,
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ granted: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await requestArticleAccess("doomscrolling");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer account-token",
        }),
      }),
    );
  });

  it.each([
    ["a false grant", JSON.stringify({ granted: false }), "application/json"],
    ["a malformed grant", JSON.stringify({ allowed: true }), "application/json"],
    ["an HTML success page", "<html>ok</html>", "text/html"],
  ])("fails closed on %s", async (_label, body, contentType) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(body, {
          status: 200,
          headers: { "content-type": contentType },
        }),
      ),
    );

    await expect(requestArticleAccess("doomscrolling")).resolves.toMatchObject({
      granted: false,
      reason: "unavailable",
    });
  });

  it("fails closed on a redirect response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 302,
          headers: { location: "https://example.test/fallback" },
        }),
      ),
    );

    await expect(requestArticleAccess("doomscrolling")).resolves.toMatchObject({
      granted: false,
      reason: "unavailable",
    });
  });

  it("maps exhausted guest access to sign-in without returning content", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            detail: {
              next_action: "sign_in",
              message: "Sign in to continue.",
            },
          }),
          { status: 402, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    await expect(requestArticleAccess("doomscrolling")).resolves.toEqual({
      granted: false,
      reason: "sign_in",
      message: "Sign in to continue.",
    });
  });

  it("maps an exhausted account to Membership", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            detail: {
              next_action: "membership",
              message: "Membership is required.",
            },
          }),
          { status: 402, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    await expect(requestArticleAccess("doomscrolling")).resolves.toEqual({
      granted: false,
      reason: "membership",
      message: "Membership is required.",
    });
  });

  it("asks for sign-in when a presented session is invalid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    );

    await expect(requestArticleAccess("doomscrolling")).resolves.toMatchObject({
      granted: false,
      reason: "session",
    });
  });

  it("fails closed when backend configuration is absent", async () => {
    delete process.env.API_BASE_URL;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestArticleAccess("doomscrolling")).resolves.toMatchObject({
      granted: false,
      reason: "unavailable",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed when the backend is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(requestArticleAccess("doomscrolling")).resolves.toMatchObject({
      granted: false,
      reason: "unavailable",
    });
  });

  it("does not consume access during router prefetch", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "next-router-prefetch": "1" }) as never,
    );
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestArticleAccess("doomscrolling")).resolves.toMatchObject({
      granted: false,
      reason: "unavailable",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not consume access for a cross-site embedded request", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-dest": "image",
      }) as never,
    );
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestArticleAccess("doomscrolling")).resolves.toMatchObject({
      granted: false,
      reason: "unavailable",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not consume account or guest quota on cross-site top-level navigation", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
      }) as never,
    );
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestArticleAccess("doomscrolling")).resolves.toMatchObject({
      granted: false,
      reason: "unavailable",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not consume quota when navigation provenance is missing", async () => {
    vi.mocked(headers).mockResolvedValue(new Headers() as never);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestArticleAccess("doomscrolling")).resolves.toMatchObject({
      granted: false,
      reason: "unavailable",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not consume quota on a sibling-origin same-site navigation", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "sec-fetch-site": "same-site" }) as never,
    );
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestArticleAccess("doomscrolling")).resolves.toMatchObject({
      granted: false,
      reason: "unavailable",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts a direct address-bar navigation with Sec-Fetch-Site none", async () => {
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "sec-fetch-site": "none" }) as never,
    );
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ granted: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(requestArticleAccess("doomscrolling")).resolves.toEqual({
      granted: true,
    });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});
