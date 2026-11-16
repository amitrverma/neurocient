import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import InsightAccessGate from "../src/app/insights/[slug]/InsightAccessGate";

vi.mock("../src/app/components/AuthModal", () => ({
  default: () => null,
}));

afterEach(cleanup);

describe("InsightAccessGate", () => {
  it("presents expired-session recovery as a platform account surface", () => {
    render(
      <InsightAccessGate
        title="Why knowing is not enough"
        date="16 November 2026"
        author="Neurocient"
        typographyVariant="prologue"
        publicLead={<p>Public lead</p>}
        access={{
          granted: false,
          reason: "session",
          message: "Your session has expired. Sign in again to continue reading.",
        }}
      />,
    );

    const gate = screen.getByRole("region", { name: "Continue reading" });
    expect(gate).toHaveClass("rounded-lg", "font-sans");
    expect(screen.getByRole("button", { name: "Sign in or create an account" }))
      .toHaveClass("bg-brand-secondary", "text-brand-dark");
  });
});
