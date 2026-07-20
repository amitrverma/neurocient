import { questionsBank } from "./questionsBank";
import { buildScanPortrait } from "./scanPortrait";
import type { CavemanScanResponse } from "./scanStorage";

const SAVED_SESSION_KEY = "neurocient:caveman-scan-saved-session";

const responseSignature = (responses: CavemanScanResponse[]) =>
  responses.map((response) => response.evidence?.optionId ?? response.label).join("|");

export const saveCompletedPortrait = async (
  responses: CavemanScanResponse[],
  accountKey: string,
) => {
  if (responses.length !== questionsBank.length) return;

  const signature = `${accountKey}:${responseSignature(responses)}`;
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
      scoring_version: "protective-moves-1",
      report_version: "two-level-portrait-1",
      scenario_ids: questionsBank.map((question) => String(question.id)),
    }),
  });
  if (!createResponse.ok) throw new Error("Could not create a saved Scan session.");

  const session = (await createResponse.json()) as { id: string; accessToken: string };
  const allEvidence = responses.flatMap((response, index) => {
    const hydrated =
      response.evidence ??
      questionsBank[index]?.options.find((option) => option.label === response.label)?.evidence;
    return hydrated ? [hydrated] : [];
  });
  const completedResponse = await fetch(`/api/caveman-scan/sessions/${session.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      accessToken: session.accessToken,
      status: "completed",
      responses,
      evidence: { selections: allEvidence },
      portrait: buildScanPortrait(allEvidence),
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
