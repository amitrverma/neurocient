import type { ScanScienceBlock } from "./questionsBank";

export type CavemanScanStage = "intro" | "questions" | "result";

export type CavemanScanResponse = {
  label: string;
  type: "caveman" | "modern";
  reflection: string;
  science: ScanScienceBlock | null;
};

export type CavemanScanState = {
  stage: CavemanScanStage;
  current: number;
  responses: CavemanScanResponse[];
};

export const CAVEMAN_SCAN_STORAGE_KEY = "neurocient:caveman-scan-state";

export const isCavemanScanStage = (
  value: unknown,
): value is CavemanScanStage =>
  value === "intro" || value === "questions" || value === "result";
