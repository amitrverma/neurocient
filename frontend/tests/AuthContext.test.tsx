import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AuthProvider, useAuth } from "../src/app/context/AuthContext";

vi.mock("posthog-js", () => ({
  default: { identify: vi.fn(), reset: vi.fn() },
}));

function Probe() {
  const { ready, user } = useAuth();
  return <div>{ready ? user?.email ?? "anonymous" : "loading"}</div>;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AuthProvider session initialization", () => {
  it("uses the existing access session without rotating it", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "1", email: "person@example.com" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(await screen.findByText("person@example.com")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/me", {
      credentials: "include",
    });
  });

  it("recovers when another tab wins refresh rotation", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 409 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "1", email: "person@example.com" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    await waitFor(
      () => expect(screen.getByText("person@example.com")).toBeInTheDocument(),
      { timeout: 1500 },
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/auth/refresh",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
