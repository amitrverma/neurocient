import { describe, expect, it } from "vitest";
import { questionsBank } from "./questionsBank";
import { buildResultSummary, restoreResultResponses } from "./scanResultSummary";

const answers = (overrides: Record<number, number> = {}, flexible = false) =>
  questionsBank.map((question) => {
    const id = `${question.id}-${overrides[question.id] ?? (flexible ? 5 : 1)}`;
    return question.options.find((option) => option.evidence?.optionId === id)!;
  });

describe("public Scan result", () => {
  it("reports whether automatic processing appeared without producing a dominant pattern", () => {
    expect(buildResultSummary(answers())).toEqual({ automaticCount: 12, deliberateCount: 0 });
    expect(buildResultSummary(answers({ 1: 1 }, true))).toEqual({ automaticCount: 1, deliberateCount: 11 });
    expect(buildResultSummary(answers({}, true))).toEqual({ automaticCount: 0, deliberateCount: 12 });
  });

  it("does not count multiple answers to one situation twice", () => {
    expect(buildResultSummary([answers()[0], answers()[0]])).toEqual({ automaticCount: 1, deliberateCount: 0 });
  });

  it("uses canonical evidence even when stored fields or labels have changed", () => {
    const responses = answers().map((option) => ({ ...option, label: "Old wording", evidence: { ...option.evidence, move: "flexible_response" } }));
    const restored = restoreResultResponses({ stage: "result", responses });
    expect(restored).not.toBeNull();
    expect(buildResultSummary(restored!)).toEqual({ automaticCount: 12, deliberateCount: 0 });
    expect(restored![0].label).toBe(answers()[0].label);
  });

  it("restores legacy answers without evidence using their scenario and label", () => {
    const responses = answers({}, true).map(({ label, type, reflection, science }) => ({ label, type, reflection, science }));
    expect(restoreResultResponses({ stage: "result", responses })).toHaveLength(questionsBank.length);
  });

  it.each([
    null, {}, { stage: "questions", responses: answers() },
    { stage: "result", responses: [] },
    { stage: "result", responses: Array(questionsBank.length).fill(answers()[0]) },
    { stage: "result", responses: answers().map((item, i) => i ? item : null) },
    { stage: "result", responses: answers().map((item, i) => i ? item : { ...item, evidence: { optionId: "unknown" } }) },
    { stage: "result", responses: answers().map((item, i) => i ? item : { label: "unknown" }) },
  ])("rejects incomplete or corrupt saved data (%#)", (saved) => {
    expect(restoreResultResponses(saved)).toBeNull();
  });
});
