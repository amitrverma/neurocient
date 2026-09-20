import { questionsBank } from "./questionsBank";
import type { CavemanScanResponse } from "./scanStorage";

type ResolvedAnswer = {
  questionId: number;
  response: CavemanScanResponse;
};

const canonicalOptions = questionsBank.flatMap((question) =>
  question.options.map((option) => ({ question, option })),
);

// Persisted evidence is a lookup key, never an authoritative interpretation.
const resolveAnswer = (value: unknown, index: number): ResolvedAnswer | undefined => {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as { evidence?: { optionId?: unknown }; label?: unknown };
  const resolved = raw.evidence?.optionId !== undefined
    ? canonicalOptions.find(({ option }) => option.evidence?.optionId === raw.evidence?.optionId)
    : (() => {
        const question = questionsBank[index];
        const option = question?.options.find((item) => item.label === raw.label);
        return option ? { question, option } : undefined;
      })();

  if (!resolved) return undefined;
  return {
    questionId: resolved.question.id,
    response: { ...resolved.option, science: resolved.option.science ?? null },
  };
};

export const restoreResultResponses = (value: unknown): CavemanScanResponse[] | null => {
  if (!value || typeof value !== "object") return null;
  const saved = value as { stage?: unknown; responses?: unknown };
  if (saved.stage !== "result" || !Array.isArray(saved.responses) || saved.responses.length !== questionsBank.length) return null;
  const resolved = saved.responses.map(resolveAnswer);
  if (resolved.some((entry) => !entry) || new Set(resolved.map((entry) => entry?.questionId)).size !== questionsBank.length) return null;

  return questionsBank.map((question) =>
    resolved.find((entry) => entry?.questionId === question.id)!.response,
  );
};

export const buildResultSummary = (responses: readonly unknown[]) => {
  const unique = new Map<number, CavemanScanResponse>();
  responses.forEach((response, index) => {
    const resolved = resolveAnswer(response, index);
    if (resolved && !unique.has(resolved.questionId)) {
      unique.set(resolved.questionId, resolved.response);
    }
  });

  const automaticCount = [...unique.values()].filter(
    (response) => response.evidence?.move !== "flexible_response",
  ).length;
  const deliberateCount = [...unique.values()].filter(
    (response) => response.evidence?.move === "flexible_response",
  ).length;

  return { automaticCount, deliberateCount };
};
