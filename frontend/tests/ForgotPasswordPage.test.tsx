import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";

import ForgotPasswordPage from "../src/app/forgot-password/page";

afterEach(cleanup);

describe("ForgotPasswordPage", () => {
  it("uses the shared account surface and authentication action hierarchy", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByRole("heading", { name: "Reset your password" }))
      .toHaveClass("font-sans");
    expect(screen.getByRole("button", { name: "Send reset link" }))
      .toHaveClass("rounded-lg", "bg-brand-secondary", "text-brand-dark");
  });
});
