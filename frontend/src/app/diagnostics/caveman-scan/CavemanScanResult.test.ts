import { describe, expect, it } from "vitest";
import { buildPersonalizedForward } from "./CavemanScanResult";
import { getOptionEvidence } from "./scanEvidence";
import { buildScanPortrait } from "./scanPortrait";

const portraitFrom = (...pairs: Array<[number, number]>) =>
  buildScanPortrait(
    pairs.map(([scenario, option]) => getOptionEvidence(scenario, option)!),
  );

describe("buildPersonalizedForward", () => {
  it("changes guidance when selected evidence points to a different concern", () => {
    const uncertainty = buildPersonalizedForward(
      portraitFrom([1, 0], [9, 0], [12, 1]).primary,
    );
    const status = buildPersonalizedForward(
      portraitFrom([2, 0], [2, 1], [2, 2]).primary,
    );

    expect(uncertainty.environment).toContain("next visible move");
    expect(status.environment).toContain("other people's progress");
    expect(uncertainty.action).not.toBe(status.action);
  });

  it("carries the selected evidence and drive into the way forward", () => {
    const forward = buildPersonalizedForward(
      portraitFrom([1, 0], [9, 0], [12, 1]).primary,
    );

    expect(forward.anchor?.mirror).toBeTruthy();
    expect(forward.drive?.name).toBe("Safety & Survival");
  });
});
