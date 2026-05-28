export type CICDiagnosticStage = "intro" | "questions" | "summary";

export type CICDiagnosticState = {
  stage: CICDiagnosticStage;
  responses: Record<string, string>;
};

export const CIC_DIAGNOSTIC_STORAGE_KEY = "neurocient:cic-diagnostic-state";

export const isCICDiagnosticStage = (
  value: unknown,
): value is CICDiagnosticStage =>
  value === "intro" || value === "questions" || value === "summary";
