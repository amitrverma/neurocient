import { questionsBank } from "./questionsBank";
import { buildScanReflections, scanResponseSignature } from "./scanReflections";
import type { CavemanScanResponse } from "./scanStorage";

const SAVED_SESSION_KEY = "neurocient:caveman-scan-saved-session";

export const saveCompletedPortrait = async (
  responses: CavemanScanResponse[],
  accountKey: string,
) => {
  if (responses.length !== questionsBank.length) return;

  const signature = `${accountKey}:${scanResponseSignature(responses)}`;
  const existing = window.localStorage.getItem(SAVED_SESSION_KEY);
  if (existing) {
    try {
      if ((JSON.parse(existing) as { signature?: string }).signature === signature) return;
    } catch {
      window.localStorage.removeItem(SAVED_SESSION_KEY);
    }
  }

  const createResponse = await fetch("/api/caveman-scan/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scan_version: "recognition-1",
      scoring_version: "selected-response-1",
      report_version: "answer-reflections-1",
      scenario_ids: questionsBank.map((question) => String(question.id)),
    }),
  });
  if (!createResponse.ok) throw new Error("Could not create a saved Scan session.");

  const session = (await createResponse.json()) as { id: string; accessToken: string };
  const storedResponses = responses.map(({ label, type, reflection, science }) => ({
    label,
    type,
    reflection,
    science,
  }));
  const reflectionOptionIds = buildScanReflections(responses).map(({ id }) => id);
  const completedResponse = await fetch(`/api/caveman-scan/sessions/${session.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accessToken: session.accessToken,
      status: "completed",
      responses: storedResponses,
      evidence: { selectedOptionIds: scanResponseSignature(responses).split("|") },
      portrait: { version: "answer-reflections-1", reflectionOptionIds },
    }),
  });
  if (!completedResponse.ok) throw new Error("Could not complete the saved Scan session.");

  window.localStorage.setItem(
    SAVED_SESSION_KEY,
    JSON.stringify({ id: session.id, signature }),
  );
};

export const loadLatestPortrait = async (): Promise<CavemanScanResponse[] | null> => {
  const response = await fetch("/api/caveman-scan/sessions/latest", { cache: "no-store" });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Could not load the latest Scan portrait.");
  const session = (await response.json()) as { responses?: CavemanScanResponse[] };
  return Array.isArray(session.responses) ? session.responses : null;
};

export const clearSavedPortraitMarker = () => {
  window.localStorage.removeItem(SAVED_SESSION_KEY);
};
