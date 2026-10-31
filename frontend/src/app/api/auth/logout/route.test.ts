import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

afterEach(() => vi.unstubAllGlobals());

describe("logout API boundary", () => {
  it("marks the request and forwards every clearing cookie", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 200,
      json: async () => ({ ok: true }),
      headers: {
        getSetCookie: () => [
          "access_token=; Path=/; Max-Age=0; HttpOnly",
          "refresh_token=; Path=/; Max-Age=0; HttpOnly",
          "session_present=; Path=/; Max-Age=0",
        ],
      },
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST(
      new Request("https://neurocient.test/api/auth/logout", {
        method: "POST",
        headers: { cookie: "refresh_token=copied" },
      }),
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/logout$/),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Cookie: "refresh_token=copied",
          "X-Neurocient-Auth-Request": "browser-bff",
        }),
      }),
    );
    expect(response.headers.get("set-cookie")).toContain("access_token=");
    expect(response.headers.get("set-cookie")).toContain("refresh_token=");
    expect(response.headers.get("set-cookie")).toContain("session_present=");
  });
});
