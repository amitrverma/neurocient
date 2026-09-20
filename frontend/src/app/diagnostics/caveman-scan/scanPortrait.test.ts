import { describe, expect, it } from "vitest";
import { getOptionEvidence } from "./scanEvidence";
import { buildScanPortrait } from "./scanPortrait";

const evidence = (...pairs: Array<[number, number]>) =>
  pairs.map(([scenario, option]) => getOptionEvidence(scenario, option)!).filter(Boolean);

describe("buildScanPortrait", () => {
  it("connects control across different situations", () => {
    const portrait = buildScanPortrait(evidence([1, 0], [9, 0], [12, 1], [15, 1]));
    expect(portrait.primary.move).toBe("restore_control");
    expect(portrait.primary.evidence).toHaveLength(3);
  });

  it("does not invent a secondary pattern from a single answer", () => {
    const portrait = buildScanPortrait(evidence([2, 0], [13, 0], [10, 0]));
    expect(portrait.primary.move).toBe("social_monitoring");
    expect(portrait.secondary).toBeUndefined();
  });

  it("treats grounded choices as flexibility rather than a low Caveman score", () => {
    const portrait = buildScanPortrait(evidence([1, 4], [2, 4], [3, 4], [10, 4]));
    expect(portrait.primary.move).toBe("flexible_response");
    expect(portrait.headline).not.toContain("% ");
  });

  it("shows a protective concern only after repeated evidence", () => {
    const oneSignal = buildScanPortrait(evidence([1, 0], [2, 0]));
    expect(oneSignal.supportedWatchtowers).toEqual([]);

    const repeatedSignal = buildScanPortrait(evidence([1, 0], [9, 0]));
    expect(repeatedSignal.supportedWatchtowers.map(({ watchtower }) => watchtower)).toContain("horizon");
  });

  it("selects the continuation from the primary movement", () => {
    const portrait = buildScanPortrait(evidence([2, 0], [13, 0], [5, 2]));
    expect(portrait.primary.move).toBe("social_monitoring");
    expect(portrait.continuation.href).toBe("/insights/why-we-compare");
    expect(portrait.contexts).toContain("progress and comparison");
  });

  it("does not present unrelated response contexts as part of the primary movement", () => {
    const portrait = buildScanPortrait(evidence([1, 0], [9, 0], [12, 1], [2, 0]));
    expect(portrait.primary.move).toBe("restore_control");
    expect(portrait.contexts).toContain("meaningful work");
    expect(portrait.contexts).not.toContain("progress and comparison");
  });

  it("connects the usual intervention to its missing Caveman explanation", () => {
    const relief = buildScanPortrait(evidence([3, 0], [8, 0], [15, 2]));
    const control = buildScanPortrait(evidence([1, 0], [9, 0], [12, 1]));

    expect(relief.primary.usualAdvice).toContain("distraction");
    expect(relief.primary.whatItMisses).toContain("easier thing");
    expect(relief.primary.immediatePayoff).not.toBe(relief.primary.laterCost);
    expect(control.primary.usualAdvice).toContain("plan");
    expect(control.primary.usualAdvice).not.toBe(relief.primary.usualAdvice);
  });
});
