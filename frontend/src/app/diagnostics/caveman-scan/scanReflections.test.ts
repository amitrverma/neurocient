import { describe, expect, it } from "vitest";
import { questionsBank } from "./questionsBank";
import { buildScanReflections, publicScanReflections } from "./scanReflections";

const answerSet = (type: "caveman" | "modern") => questionsBank.map((question) => {
  const option = question.options.find((candidate) => candidate.type === type)!;
  return { ...option, science: option.science ?? null };
});

describe("scan answer reflections", () => {
  it("uses only situations where the selected answer brought out the Inner Caveman", () => {
    const responses = answerSet("modern");
    responses[0] = { ...questionsBank[0].options[0], science: questionsBank[0].options[0].science ?? null };
    const reflections = buildScanReflections(responses);
    expect(reflections).toHaveLength(1);
    expect(reflections[0].scenarioId).toBe(1);
    expect(reflections[0].selectedAnswer).toBe(responses[0].label);
    expect(reflections[0].deliberateAnswer).toBeTruthy();
  });

  it("keeps the public sample stable for the same completed Scan", () => {
    const responses = answerSet("caveman");
    expect(publicScanReflections(responses)).toEqual(publicScanReflections(responses));
    expect(publicScanReflections(responses)).toHaveLength(3);
  });

  it("does not manufacture reflections when every selected response is deliberate", () => {
    expect(buildScanReflections(answerSet("modern"))).toEqual([]);
  });

  it("does not expose a drive, type, or inferred person-level pattern", () => {
    const [reflection] = buildScanReflections(answerSet("caveman"));
    expect(Object.keys(reflection)).not.toContain("move");
    expect(Object.keys(reflection)).not.toContain("drive");
    expect(Object.keys(reflection)).not.toContain("pattern");
  });
});
