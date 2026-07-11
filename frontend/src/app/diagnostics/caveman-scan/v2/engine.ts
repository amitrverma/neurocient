import { WATCHTOWER_IDS } from "./watchtowers";
import type {
  PortraitFoundation, ScanEvidence, ScanResponse, ScanScenario, TriggerId, WatchtowerId,
} from "./types";

export const SCAN_VERSION = "watchtowers-1";
export const SCORING_VERSION = "evidence-1";
export const REPORT_VERSION = "portrait-foundation-1";
export const DEFAULT_SCENARIO_COUNT = 12;

const xmur3 = (value: string) => {
  let hash = 1779033703 ^ value.length;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
};

const mulberry32 = (seed: number) => () => {
  let value = (seed += 0x6d2b79f5);
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

export const selectScenarios = (
  bank: ScanScenario[], seed: string, count = DEFAULT_SCENARIO_COUNT,
): ScanScenario[] => {
  const active = bank.filter((scenario) => scenario.status === "active");
  if (count < 1 || count > active.length) throw new Error("Invalid scenario count");
  const uniqueTriggers = new Set(active.map((scenario) => scenario.triggerId));
  if (uniqueTriggers.size < count) throw new Error("Scenario bank cannot supply unique triggers");

  const random = mulberry32(xmur3(seed)());
  const shuffled = [...active];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[other]] = [shuffled[other], shuffled[index]];
  }

  const selected: ScanScenario[] = [];
  const triggers = new Set<TriggerId>();
  for (const scenario of shuffled) {
    if (triggers.has(scenario.triggerId)) continue;
    selected.push(scenario);
    triggers.add(scenario.triggerId);
    if (selected.length === count) break;
  }
  return selected;
};

export const orderScenarioOptions = (scenario: ScanScenario, seed: string) => {
  const random = mulberry32(xmur3(`${seed}:${scenario.id}:options`)());
  const ordered = [...scenario.options];
  for (let index = ordered.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [ordered[index], ordered[other]] = [ordered[other], ordered[index]];
  }
  return ordered;
};

export const createResponse = (
  scenario: ScanScenario, optionId: string, presentationIndex: number, responseTimeMs?: number,
): ScanResponse => {
  const option = scenario.options.find((candidate) => candidate.id === optionId);
  if (!option) throw new Error(`Option ${optionId} does not belong to scenario ${scenario.id}`);
  return {
    scenarioId: scenario.id,
    scenarioVersion: scenario.version,
    triggerId: scenario.triggerId,
    optionId: option.id,
    selectedTarget: option.mapping.primary,
    answeredAt: new Date().toISOString(),
    responseTimeMs,
    presentationIndex,
    snapshot: { story: scenario.story, optionText: option.text, mapping: structuredClone(option.mapping) },
  };
};

export const scoreResponses = (responses: ScanResponse[]): ScanEvidence => {
  const totals = Object.fromEntries(WATCHTOWER_IDS.map((id) => [id, 0])) as Record<WatchtowerId, number>;
  let rationalCount = 0;
  for (const response of responses) {
    const { primary, weight, secondary } = response.snapshot.mapping;
    if (primary === "rational") rationalCount += weight;
    else totals[primary] += weight;
    if (secondary) {
      for (const [id, secondaryWeight] of Object.entries(secondary)) {
        totals[id as WatchtowerId] += secondaryWeight ?? 0;
      }
    }
  }

  const ranked = WATCHTOWER_IDS.map((id) => ({ id, total: totals[id] }))
    .sort((left, right) => right.total - left.total);
  const maximum = ranked[0]?.total ?? 0;
  const second = ranked[1]?.total ?? 0;
  const leadingWatchtowers = maximum === 0 ? [] : ranked.filter((item) => item.total === maximum).map((item) => item.id);
  const patternShape = maximum === 0 || leadingWatchtowers.length > 1
    ? "mixed"
    : maximum - second >= 2 ? "clear" : "emerging";

  return {
    watchtowerTotals: totals,
    rationalCount,
    responseCount: responses.length,
    leadingWatchtowers,
    patternShape,
    triggerPatterns: responses.map(({ triggerId, selectedTarget }) => ({ triggerId, selectedTarget })),
  };
};

export const buildPortraitFoundation = (responses: ScanResponse[]): PortraitFoundation => {
  const evidence = scoreResponses(responses);
  const ranked = WATCHTOWER_IDS.map((id) => ({ id, total: evidence.watchtowerTotals[id] }))
    .filter((item) => item.total > 0)
    .sort((left, right) => right.total - left.total);
  const primary = ranked[0]?.id ?? null;
  const supporting = ranked.find((item) => item.id !== primary)?.id ?? null;
  return {
    scoringVersion: SCORING_VERSION,
    reportVersion: REPORT_VERSION,
    evidence,
    preview: {
      primaryWatchtower: primary,
      supportingWatchtower: supporting,
      rationalContexts: responses.filter((response) => response.selectedTarget === "rational").map((response) => response.triggerId),
      primaryContexts: primary
        ? responses.filter((response) => response.selectedTarget === primary).map((response) => response.triggerId)
        : [],
    },
  };
};
