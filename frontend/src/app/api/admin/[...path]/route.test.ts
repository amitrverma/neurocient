import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";

describe("admin API proxy", () => {
  const originalApiBaseUrl = process.env.API_BASE_URL;

  beforeEach(() => {
    process.env.API_BASE_URL = "https://backend.example";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalApiBaseUrl === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = originalApiBaseUrl;
  });

  it("preserves filters, pagination, and the authenticated cookie", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ items: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new Request("http://localhost/api/admin/users?page=2&query=amit", {
        headers: { cookie: "access_token=secret" },
      }),
      { params: Promise.resolve({ path: ["users"] }) },
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example/api/admin/users?page=2&query=amit",
      expect.objectContaining({
        headers: expect.objectContaining({ Cookie: "access_token=secret" }),
      }),
    );
  });

  it("returns a stable unavailable response when the backend cannot be reached", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const response = await GET(
      new Request("http://localhost/api/admin/users"),
      { params: Promise.resolve({ path: ["users"] }) },
    );
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({ detail: "Admin service unavailable" });
  });
});
