import { cleanup, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import SpotsPage from "./page";

const mocks = vi.hoisted(() => ({
  user: { id: "user-1" },
}));

vi.mock("@/app/context/AuthContext", () => ({
  useAuth: () => ({ user: mocks.user, ready: true }),
}));
vi.mock("../../components/AuthModal", () => ({ default: () => null }));
vi.mock("../../components/MembershipModal", () => ({ default: () => null }));
vi.mock("../../components/NotificationProvider", () => ({
  useNotification: () => ({ notify: vi.fn() }),
}));
vi.mock("../../utils/usage", () => ({
  getUsage: () => 0,
  hasActiveMembership: () => true,
  incrementUsage: vi.fn(),
  usageLimits: { user: { spots: 15 } },
}));
vi.mock("../../utils/analytics", () => ({ trackEvent: vi.fn() }));

describe("Spot capture hierarchy", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("offers the capture action in the opening task area before recent history", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    render(<SpotsPage />);

    const quickCapture = await screen.findByRole("region", {
      name: "Record a spot",
    });
    expect(within(quickCapture).getByLabelText("Add your observation")).toBeVisible();
    expect(within(quickCapture).getByRole("button", { name: "Log it" })).toBeVisible();

    const history = screen.getByRole("region", { name: "Recent spots" });
    expect(
      quickCapture.compareDocumentPosition(history) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
