import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import ResetPasswordForm from "../src/app/reset-password/ResetPasswordForm";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

describe("ResetPasswordForm", () => {
  it("captures the reset secret from the fragment and removes it from the URL", async () => {
    const token = "a".repeat(43);
    window.history.replaceState(null, "", `/reset-password#token=${token}`);
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(<ResetPasswordForm />);
    expect(window.location.hash).toBe("");

    const inputs = screen.getAllByLabelText(/password/i);
    expect(inputs[0]).toHaveAttribute("minlength", "8");
    expect(inputs[1]).toHaveAttribute("minlength", "8");
    expect(screen.getByText(/use at least 8 characters/i)).toBeInTheDocument();
    fireEvent.change(inputs[0], { target: { value: "a secure new passphrase" } });
    fireEvent.change(inputs[1], { target: { value: "a secure new passphrase" } });
    const submit = screen.getByRole("button", { name: "Update password" });
    expect(submit).toHaveClass("rounded-lg", "bg-brand-secondary", "text-brand-dark");
    fireEvent.click(submit);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/password-reset/confirm",
      expect.objectContaining({
        body: JSON.stringify({ token, password: "a secure new passphrase" }),
      }),
    );
    expect(await screen.findByText(/password has been updated/i)).toBeInTheDocument();
  });
});
