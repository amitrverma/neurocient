"use client";

import { useState } from "react";
import DiagnosticIntro from "./DiagnosticIntro";
import DiagnosticQuestion from "./DiagnosticQuestion";
import ResultSummary from "./ResultSummary";

export default function CICDiagnosticPage() {
  const [stage, setStage] = useState<"intro" | "questions" | "summary">("intro");
  const [responses, setResponses] = useState<Record<string, string>>({});

  const handleStart = () => setStage("questions");
  const handleComplete = (answers: Record<string, string>) => {
    setResponses(answers);
    setStage("summary");
  };
  const handleRestart = () => {
    setResponses({});
    setStage("intro");
  };

  return (
    <div className="min-h-screen bg-white">
      {stage === "intro" && <DiagnosticIntro onStart={handleStart} />}
      {stage === "questions" && <DiagnosticQuestion onComplete={handleComplete} />}
      {stage === "summary" && (
        <ResultSummary responses={responses} onRestart={handleRestart} />
      )}
    </div>
  );
}
