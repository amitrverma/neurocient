import { describe, expect, it } from "vitest";
import { chooseAccountContinuation, type WorkOverview } from "./accountOverview";

const overview = (updates: Partial<WorkOverview> = {}): WorkOverview => ({
  status: "ready",
  savedCount: 0,
  spotCount: 0,
  challengeCount: 0,
  activeChallenge: false,
  hasPractice: false,
  savedArticles: [],
  latestSpot: null,
  activeChallengeTitle: null,
  activeChallengeLoggedToday: false,
  practice: null,
  ...updates,
});

describe("chooseAccountContinuation", () => {
  it("does not require the Scan when there is no saved work", () => {
    expect(chooseAccountContinuation(overview()).href).toBe(
      "/practice",
    );
  });

  it("continues with Spots when the user already has evidence", () => {
    expect(chooseAccountContinuation(overview({ spotCount: 2 })).href).toBe(
      "/tools/spots",
    );
  });

  it("prioritises an active microchallenge over Spots", () => {
    expect(
      chooseAccountContinuation(
        overview({ spotCount: 2, activeChallenge: true }),
      ).href,
    ).toBe("/tools/microchallenges");
  });

  it("prioritises an active Practice over every other continuation", () => {
    expect(
      chooseAccountContinuation(
        overview({ hasPractice: true, activeChallenge: true, spotCount: 2 }),
      ).href,
    ).toBe("/practice");
  });
});
