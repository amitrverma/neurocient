import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { questionsBank } from "../questionsBank";
import { CAVEMAN_SCAN_STORAGE_KEY } from "../scanStorage";

const session = vi.hoisted(() => ({
  user: null as null | { id: string }, ready: true,
  push: vi.fn(), replace: vi.fn(),
}));
vi.mock("next/navigation", () => ({ useRouter: () => session }));
vi.mock("@/app/context/AuthContext", () => ({ useAuth: () => session }));
// Auth is an existing boundary. Exercise this page's handoff without credentials
// or a provider/backend session; this does not prove real authentication.
vi.mock("@/app/components/AuthModal", () => ({ default: ({ isOpen, onClose, onSuccess }: {
  isOpen: boolean; onClose: () => void; onSuccess: () => void;
}) => isOpen ? <div role="dialog" aria-label="Existing login">
  <button onClick={onClose}>Dismiss login</button>
  <button onClick={onSuccess}>Complete test login</button>
</div> : null }));

import ResultPage from "./page";

const saveResult = () => window.localStorage.setItem(CAVEMAN_SCAN_STORAGE_KEY, JSON.stringify({
  stage: "result",
  responses: questionsBank.map((question) => question.options[0]),
}));

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
  session.user = null;
  session.ready = true;
});
afterEach(cleanup);

describe("result route handoff", () => {
  it("keeps a guest result after dismissing login and enters the product after success", async () => {
    saveResult();
    render(<ResultPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Log in to get started" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss login" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(window.localStorage.getItem(CAVEMAN_SCAN_STORAGE_KEY)).not.toBeNull();
    expect(session.push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Log in to get started" }));
    fireEvent.click(screen.getByRole("button", { name: "Complete test login" }));
    expect(session.push).toHaveBeenCalledWith("/tools/spots");
  });

  it("sends an authenticated reader directly to the same product destination", async () => {
    saveResult(); session.user = { id: "test-user" };
    render(<ResultPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Open Spot the Caveman" }));
    expect(session.push).toHaveBeenCalledWith("/tools/spots");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it.each(["{", JSON.stringify({ stage: "result", responses: Array(12).fill(null) })])("clears corrupt completed data before returning to Scan (%#)", async (saved) => {
    window.localStorage.setItem(CAVEMAN_SCAN_STORAGE_KEY, saved);
    render(<ResultPage />);
    await waitFor(() => expect(session.replace).toHaveBeenCalledWith("/diagnostics/caveman-scan"));
    expect(window.localStorage.getItem(CAVEMAN_SCAN_STORAGE_KEY)).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("returns missing results to the Scan", async () => {
    render(<ResultPage />);
    await waitFor(() => expect(session.replace).toHaveBeenCalledWith("/diagnostics/caveman-scan"));
  });

  it("preserves an unfinished Scan when the result URL is opened directly", async () => {
    const draft = JSON.stringify({ stage: "questions", current: 1, responses: [questionsBank[0].options[0]] });
    window.localStorage.setItem(CAVEMAN_SCAN_STORAGE_KEY, draft);
    render(<ResultPage />);
    await waitFor(() => expect(session.replace).toHaveBeenCalledWith("/diagnostics/caveman-scan"));
    expect(window.localStorage.getItem(CAVEMAN_SCAN_STORAGE_KEY)).toBe(draft);
  });
});
