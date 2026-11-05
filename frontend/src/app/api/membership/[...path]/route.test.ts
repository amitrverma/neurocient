import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

describe("membership API proxy", () => {
  const originalApiBaseUrl = process.env.API_BASE_URL;

  beforeEach(() => {
    process.env.API_BASE_URL = "https://backend.example";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalApiBaseUrl === undefined) delete process.env.API_BASE_URL;
    else process.env.API_BASE_URL = originalApiBaseUrl;
  });

  it("forwards the selected checkout offer and content type", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ subscription_id: "sub_usd" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("http://localhost/api/membership/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: "access_token=secret",
        },
        body: JSON.stringify({ offer_id: "usd" }),
      }),
      { params: Promise.resolve({ path: ["checkout"] }) },
    );

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example/api/membership/checkout",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ offer_id: "usd" }),
        headers: expect.objectContaining({
          Cookie: "access_token=secret",
          "Content-Type": "application/json",
        }),
      }),
    );
  });
});
