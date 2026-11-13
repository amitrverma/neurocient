import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import MicrochallengesPage from "./page";

const mocks = vi.hoisted(() => ({
  notify: vi.fn(),
  user: { id: "user-1" },
}));

vi.mock("@/app/context/AuthContext", () => ({
  useAuth: () => ({ user: mocks.user, ready: true }),
}));
vi.mock("../../components/NotificationProvider", () => ({
  useNotification: () => ({ notify: mocks.notify }),
}));
vi.mock("../../components/AuthModal", () => ({ default: () => null }));
vi.mock("../../components/MembershipModal", () => ({ default: () => null }));
vi.mock("../../components/ui/ConfettiCelebration", () => ({ default: () => null }));

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("Microchallenge daily outcomes", () => {
  beforeEach(() => {
    mocks.notify.mockReset();
    window.history.replaceState({}, "", "/tools/microchallenges");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("records Partly through the shared web log and renders the persisted outcome", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/challenges/my") {
        return jsonResponse([
          {
            assignment_id: "assignment-1",
            challenge_id: "challenge-1",
            status: "active",
            started_at: "2026-11-01T00:00:00",
            completed_at: null,
            title: "Put the phone away",
            intro: [],
            instructions: ["Leave it outside the room for ten minutes."],
            why: "",
            tips: [],
            closing: "",
            progress: 0,
            logged_today: false,
            today_outcome: null,
          },
        ]);
      }
      if (url === "/api/challenges/log" && init?.method === "POST") {
        return jsonResponse({
          message: "Log successful",
          progress: 0,
          status: "active",
          completed_at: null,
          outcome: "partly",
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<MicrochallengesPage />);

    expect(
      await screen.findByRole("group", {
        name: "How did today's experiment go?",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Open active challenge" }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Quick reflection, optional"), {
      target: { value: "The phone was still beside me." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Partly" }));

    await screen.findByText("Reported today: Partly");
    const logCall = fetchMock.mock.calls.find(
      ([url]) => String(url) === "/api/challenges/log",
    );
    expect(logCall).toBeDefined();
    expect(JSON.parse(String(logCall?.[1]?.body))).toEqual({
      assignment_id: "assignment-1",
      note: "The phone was still beside me.",
      outcome: "partly",
    });
    await waitFor(() =>
      expect(mocks.notify).toHaveBeenCalledWith(
        "Today’s outcome was recorded.",
        "success",
      ),
    );
  });
});
