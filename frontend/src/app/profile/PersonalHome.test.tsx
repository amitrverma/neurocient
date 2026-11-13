import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import PersonalHome from "./PersonalHome";
import type { WorkOverview } from "./accountOverview";

vi.mock("@/app/components/tools/NudgeOfTheDay", () => ({
  default: () => <div>Today&apos;s useful nudge</div>,
}));
vi.mock("@/app/components/tools/WeeklyReflections", () => ({
  default: () => null,
}));

const overview: WorkOverview = {
  status: "ready",
  savedCount: 0,
  spotCount: 2,
  challengeCount: 1,
  activeChallenge: true,
  hasPractice: false,
  hasScan: false,
  savedArticles: [],
  latestSpot: { date: "2026-11-13", description: "Reached for my phone." },
  activeChallengeTitle: "The Binge Interruptor",
  activeChallengeLoggedToday: false,
  practice: null,
};

describe("PersonalHome action hierarchy", () => {
  afterEach(cleanup);

  it("places a vertical current-work group alongside the daily nudge", () => {
    render(
      <PersonalHome
        overview={overview}
        cohortEnrollment={null}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText("Today's useful nudge")).toBeInTheDocument();
    const currentWork = screen.getByRole("navigation", {
      name: "Continue your work",
    });
    expect(currentWork).toBeInTheDocument();
    expect(currentWork.querySelectorAll("a")).toHaveLength(3);
    expect(screen.getByText("Next up")).toBeInTheDocument();
  });
});
