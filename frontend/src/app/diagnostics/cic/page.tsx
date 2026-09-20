"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DiagnosticIntro from "./DiagnosticIntro";
import DiagnosticQuestion from "./DiagnosticQuestion";
import AuthModal from "@/app/components/AuthModal";
import { useAuth } from "@/app/context/AuthContext";
import { trackEvent } from "../../utils/analytics";
import {
  CIC_DIAGNOSTIC_STORAGE_KEY,
  isCICDiagnosticStage,
  type CICDiagnosticStage,
} from "./cicStorage";

export default function CICDiagnosticPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [stage, setStage] = useState<CICDiagnosticStage>("intro");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [hasRestored, setHasRestored] = useState(false);
  const [showResultAuth, setShowResultAuth] = useState(false);

  useEffect(() => {
    if (!ready) return;

    try {
      const saved = window.localStorage.getItem(CIC_DIAGNOSTIC_STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as {
        stage?: unknown;
        responses?: unknown;
      };

      if (isCICDiagnosticStage(parsed.stage)) {
        if (parsed.stage === "summary") {
          if (user) {
            router.replace("/diagnostics/cic/result");
          } else {
            setShowResultAuth(true);
          }
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
  }, [ready, router, user]);

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

    if (!ready || !user) {
      setShowResultAuth(true);
      return;
    }

    router.push("/diagnostics/cic/result");
  };

  useEffect(() => {
    if (!hasRestored || showResultAuth || stage === "summary") return;

    window.localStorage.setItem(
      CIC_DIAGNOSTIC_STORAGE_KEY,
      JSON.stringify({ stage, responses }),
    );
  }, [hasRestored, responses, showResultAuth, stage]);

  if (!hasRestored) return null;

  return (
    <div className="min-h-screen bg-white">
      {stage === "intro" && <DiagnosticIntro onStart={handleStart} />}
      {stage === "questions" && <DiagnosticQuestion onComplete={handleComplete} />}
      <AuthModal
        isOpen={showResultAuth}
        onClose={() => setShowResultAuth(false)}
        onSuccess={() => router.push("/diagnostics/cic/result")}
        context="see your CIC result"
      />
    </div>
  );
}
