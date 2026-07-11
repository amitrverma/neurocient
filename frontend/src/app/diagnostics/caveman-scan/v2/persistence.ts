import type { PersistedScanSession, PortraitFoundation, ScanResponse } from "./types";
import { REPORT_VERSION, SCAN_VERSION, SCORING_VERSION } from "./engine";

const base = "/api/caveman-scan/sessions";

const parse = async (response: Response): Promise<PersistedScanSession> => {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.detail || "Could not save the scan");
  return body as PersistedScanSession;
};

export const createScanSession = async (scenarioIds: string[]) => parse(await fetch(base, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    scan_version: SCAN_VERSION,
    scoring_version: SCORING_VERSION,
    report_version: REPORT_VERSION,
    scenario_ids: scenarioIds,
  }),
}));

export const saveScanSession = async (
  session: Pick<PersistedScanSession, "id" | "accessToken">,
  responses: ScanResponse[],
  status: PersistedScanSession["status"],
  portrait?: PortraitFoundation,
) => parse(await fetch(`${base}/${session.id}`, {
  method: "PUT",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    accessToken: session.accessToken,
    status,
    responses,
    evidence: portrait?.evidence ?? null,
    portrait: portrait ?? null,
  }),
}));

export const linkScanSession = async (session: Pick<PersistedScanSession, "id" | "accessToken">) =>
  parse(await fetch(`${base}/${session.id}/link`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken: session.accessToken }),
  }));

export const getLatestScanSession = async () => parse(await fetch(`${base}/latest`, {
  method: "GET",
  credentials: "include",
  cache: "no-store",
}));
