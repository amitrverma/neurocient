import { describe, expect, it } from "vitest";
import { buildPortraitFoundation, createResponse, orderScenarioOptions, selectScenarios } from "./engine";
import { SCENARIO_BANK } from "./scenarios";

describe("watchtower scan engine", () => {
  it("selects a deterministic set of 12 unique triggers", () => {
    const first = selectScenarios(SCENARIO_BANK, "session-a");
    const second = selectScenarios(SCENARIO_BANK, "session-a");

    expect(first).toHaveLength(12);
    expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
    expect(new Set(first.map((item) => item.triggerId)).size).toBe(12);
  });

  it("keeps rational evidence separate from Watchtower totals", () => {
    const waiting = SCENARIO_BANK.find((item) => item.triggerId === "waiting")!;
    const evaluation = SCENARIO_BANK.find((item) => item.triggerId === "evaluation")!;
    const responses = [
      createResponse(waiting, "waiting-rational", 0),
      createResponse(evaluation, "evaluation-high_ground", 1),
    ];

    const portrait = buildPortraitFoundation(responses);
    expect(portrait.evidence.rationalCount).toBe(1);
    expect(portrait.evidence.watchtowerTotals.high_ground).toBe(1);
    expect(portrait.preview.primaryWatchtower).toBe("high_ground");
    expect(portrait.preview.rationalContexts).toEqual(["waiting"]);
  });

  it("stores a versioned immutable content and mapping snapshot", () => {
    const scenario = SCENARIO_BANK[0];
    const response = createResponse(scenario, "waiting-horizon", 0, 400);

    expect(response.scenarioVersion).toBe(1);
    expect(response.snapshot.story).toBe(scenario.story);
    expect(response.snapshot.mapping.primary).toBe("horizon");
    expect(response.responseTimeMs).toBe(400);
  });

  it("randomizes option presentation without changing mapping identity", () => {
    const scenario = SCENARIO_BANK[0];
    const ordered = orderScenarioOptions(scenario, "scan-seed");
    expect(ordered.map((item) => item.id).sort()).toEqual(scenario.options.map((item) => item.id).sort());
    expect(orderScenarioOptions(scenario, "scan-seed").map((item) => item.id)).toEqual(ordered.map((item) => item.id));
  });
});
