"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DiagnosticIntro from "./DiagnosticIntro";
import DiagnosticQuestion from "./DiagnosticQuestion";
import { trackEvent } from "../../utils/analytics";
import {
  CIC_DIAGNOSTIC_STORAGE_KEY,
  isCICDiagnosticStage,
  type CICDiagnosticStage,
} from "./cicStorage";

export default function CICDiagnosticPage() {
  const router = useRouter();
  const [stage, setStage] = useState<CICDiagnosticStage>("intro");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [hasRestored, setHasRestored] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CIC_DIAGNOSTIC_STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as {
        stage?: unknown;
        responses?: unknown;
      };

      if (isCICDiagnosticStage(parsed.stage)) {
        if (parsed.stage === "summary") {
          router.replace("/diagnostics/cic/result");
          return;
        }

        setStage(parsed.stage);
      }

      if (parsed.responses && typeof parsed.responses === "object") {
        setResponses(parsed.responses as Record<string, string>);
      }
    } catch {
      window.localStorage.removeItem(CIC_DIAGNOSTIC_STORAGE_KEY);
    } finally {
      setHasRestored(true);
    }
  }, [router]);

  const handleStart = () => {
    trackEvent("Diagnostic Started", { type: "cic" });
    setStage("questions");
  };

  const handleComplete = (answers: Record<string, string>) => {
    setResponses(answers);
    setStage("summary");
    window.localStorage.setItem(
      CIC_DIAGNOSTIC_STORAGE_KEY,
      JSON.stringify({ stage: "summary", responses: answers }),
    );
    trackEvent("Diagnostic Completed", { type: "cic" });
    router.push("/diagnostics/cic/result");
  };

  useEffect(() => {
    if (!hasRestored || stage === "summary") return;

    window.localStorage.setItem(
      CIC_DIAGNOSTIC_STORAGE_KEY,
      JSON.stringify({ stage, responses }),
    );
  }, [hasRestored, responses, stage]);

  if (!hasRestored) return null;

  return (
    <div className="min-h-screen bg-white">
      {stage === "intro" && <DiagnosticIntro onStart={handleStart} />}
      {stage === "questions" && <DiagnosticQuestion onComplete={handleComplete} />}
    </div>
  );
}
