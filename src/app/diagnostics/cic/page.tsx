"use client";

import { useState } from "react";
import DiagnosticIntro from "./DiagnosticIntro";
import DiagnosticQuestion from "./DiagnosticQuestion";
import ResultSummary from "./ResultSummary";
import { trackEvent } from "../../utils/analytics";

export default function CICDiagnosticPage() {
  const [stage, setStage] = useState<"intro" | "questions" | "summary">("intro");
  const [responses, setResponses] = useState<Record<string, string>>({});

  const handleStart = () => {
    trackEvent("Diagnostic Started", { type: "cic" });
    setStage("questions");
  };
  const handleComplete = (answers: Record<string, string>) => {
    setResponses(answers);
    setStage("summary");
    trackEvent("Diagnostic Completed", { type: "cic" });
  };

  return (
    <div className="min-h-screen bg-white">
      {stage === "intro" && <DiagnosticIntro onStart={handleStart} />}
      {stage === "questions" && <DiagnosticQuestion onComplete={handleComplete} />}
      {stage === "summary" && (
        <ResultSummary responses={responses} />
      )}
    </div>
  );
}
