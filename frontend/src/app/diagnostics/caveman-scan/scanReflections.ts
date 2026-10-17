import { questionsBank } from "./questionsBank";
import type { CavemanScanResponse } from "./scanStorage";

export type ScanReflection = {
  id: string;
  scenarioId: number;
  title: string;
  selectedAnswer: string;
  selectedMirror: string;
  deliberateAnswer?: string;
  deliberateMirror?: string;
  question: string;
};

const scenarioTitles: Record<number, string> = {
  1: "The report and the inbox",
  2: "Someone else’s milestone",
  3: "The next easy scroll",
  5: "The message left unsent",
  8: "The workout postponed",
  9: "The routine after one missed day",
  10: "The conversation left for later",
  11: "The final demand of a long day",
  12: "Rest with unfinished work nearby",
  13: "The pause after you spoke",
  14: "A morning without restored energy",
  15: "The verdict at the end of the day",
};

const reflectionQuestions = [
  "What did this response make easier immediately?",
  "What did you know mattered, even as you chose something else?",
  "Where have you noticed a response like this outside the Scan?",
  "What changed as soon as you followed this response?",
];

const hash = (value: string) => {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
};

const canonicalOption = (response: CavemanScanResponse, questionIndex: number) => {
  const question = questionsBank[questionIndex];
  if (!question) return undefined;
  return question.options.find((option) =>
    response.evidence?.optionId
      ? option.evidence?.optionId === response.evidence.optionId
      : option.label === response.label,
  );
};

export const scanResponseSignature = (responses: CavemanScanResponse[]) =>
  responses.map((response, index) =>
    canonicalOption(response, index)?.evidence?.optionId ?? `${questionsBank[index]?.id ?? index}:${response.label}`,
  ).join("|");

export const buildScanReflections = (responses: CavemanScanResponse[]) => {
  const signature = scanResponseSignature(responses);
  const reflections = responses.flatMap((response, index) => {
    const question = questionsBank[index];
    const selected = canonicalOption(response, index);
    if (!question || !selected || selected.type !== "caveman") return [];

    const deliberate = question.options.find((option) => option.type === "modern");
    const id = selected.evidence?.optionId ?? `${question.id}:${selected.label}`;
    return [{
      id,
      scenarioId: question.id,
      title: scenarioTitles[question.id] ?? `Situation ${question.id}`,
      selectedAnswer: selected.label,
      selectedMirror: selected.evidence?.mirror ?? selected.label,
      deliberateAnswer: deliberate?.label,
      deliberateMirror: deliberate?.evidence?.mirror,
      question: reflectionQuestions[hash(`${signature}:${id}`) % reflectionQuestions.length],
    } satisfies ScanReflection];
  });

  return [...reflections].sort((a, b) =>
    hash(`${signature}:${a.id}:order`) - hash(`${signature}:${b.id}:order`),
  );
};

export const publicScanReflections = (responses: CavemanScanResponse[], limit = 3) =>
  buildScanReflections(responses).slice(0, limit);
