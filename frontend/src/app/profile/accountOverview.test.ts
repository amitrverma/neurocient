import { describe, expect, it } from "vitest";
import { buildReturnQuestion, chooseAccountContinuation, type WorkOverview } from "./accountOverview";

const overview = (updates: Partial<WorkOverview> = {}): WorkOverview => ({
  status: "ready",
  savedCount: 0,
  spotCount: 0,
  challengeCount: 0,
  activeChallenge: false,
  hasPractice: false,
  hasPortrait: false,
  savedArticles: [],
  latestSpot: null,
  activeChallengeTitle: null,
  activeChallengeLoggedToday: false,
  practice: null,
  latestReflection: null,
  ...updates,
});

describe("buildReturnQuestion", () => {
  it("grounds the question in an active experiment before other material", () => {
    expect(buildReturnQuestion(overview({
      activeChallengeTitle: "Begin before ready",
      practice: { action: "Open the document" },
    }))).toContain("Begin before ready");
  });

  it("brings a saved idea into reflection when no active work exists", () => {
    expect(buildReturnQuestion(overview({
      savedArticles: [{ slug: "starting", title: "Why starting feels difficult" }],
    }))).toContain("Why starting feels difficult");
  });
});

describe("chooseAccountContinuation", () => {
  it("does not require the Scan when there is no saved work", () => {
    expect(chooseAccountContinuation(overview()).href).toBe(
      "/practice",
    );
  });

  it("moves from a portrait into real-life Spots", () => {
    expect(chooseAccountContinuation(overview({ hasPortrait: true })).href).toBe(
      "/tools/spots",
    );
  });

  it("prioritises active work over the portrait", () => {
    expect(
      chooseAccountContinuation(
        overview({ hasPortrait: true, activeChallenge: true }),
      ).href,
    ).toBe("/tools/microchallenges");
  });

  it("prioritises an active Practice over every other continuation", () => {
    expect(
      chooseAccountContinuation(
        overview({ hasPractice: true, activeChallenge: true, hasPortrait: true }),
      ).href,
    ).toBe("/practice");
  });
});
