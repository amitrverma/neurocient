import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { questionsBank } from "./questionsBank";
import { CAVEMAN_SCAN_STORAGE_KEY } from "./scanStorage";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

import CavemanScan from "./CavemanScan";

beforeEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
  window.scrollTo = vi.fn();
});

afterEach(cleanup);

describe("Inner Caveman Scan entry", () => {
  it("shows the explanation before a first-time visitor begins", async () => {
    render(<CavemanScan />);

    expect(await screen.findByRole("heading", { name: /see what happens before intention catches up/i })).toBeInTheDocument();
    expect(screen.getByText(/about five minutes/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: questionsBank[0].prompt! })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /begin the scan/i }));
    expect(await screen.findByRole("heading", { name: questionsBank[0].prompt! })).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
    expect(screen.getByText("Situation 01")).toBeInTheDocument();
  });

  it("returns a visitor with unfinished answers to the explanation before resuming", async () => {
    window.localStorage.setItem(CAVEMAN_SCAN_STORAGE_KEY, JSON.stringify({
      stage: "questions",
      current: 1,
      responses: [questionsBank[0].options[0]],
    }));

    render(<CavemanScan />);

    expect(await screen.findByRole("heading", { name: /see what happens before intention catches up/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: questionsBank[1].prompt! })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /resume the scan/i }));
    await waitFor(() => expect(screen.getByRole("heading", { name: questionsBank[1].prompt! })).toBeInTheDocument());
  });

  it("continues to describe restored answers as progress after the entry screen is saved", async () => {
    window.localStorage.setItem(CAVEMAN_SCAN_STORAGE_KEY, JSON.stringify({
      stage: "intro",
      current: 1,
      responses: [questionsBank[0].options[0]],
    }));

    render(<CavemanScan />);

    expect(await screen.findByRole("button", { name: /resume the scan/i })).toBeInTheDocument();
  });
});
