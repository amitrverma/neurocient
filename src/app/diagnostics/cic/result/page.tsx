"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import ResultSummary from "../ResultSummary";
import {
  CIC_DIAGNOSTIC_STORAGE_KEY,
  type CICDiagnosticState,
} from "../cicStorage";

export default function CICDiagnosticResultPage() {
  const router = useRouter();
  const [diagnosticState, setDiagnosticState] =
    useState<CICDiagnosticState | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CIC_DIAGNOSTIC_STORAGE_KEY);
      if (!saved) {
        router.replace("/diagnostics/cic");
        return;
      }

      const parsed = JSON.parse(saved) as CICDiagnosticState;
      if (
        parsed.stage !== "summary" ||
        !parsed.responses ||
        typeof parsed.responses !== "object"
      ) {
        router.replace("/diagnostics/cic");
        return;
      }

      setDiagnosticState(parsed);
    } catch {
      window.localStorage.removeItem(CIC_DIAGNOSTIC_STORAGE_KEY);
      router.replace("/diagnostics/cic");
    } finally {
      setHasChecked(true);
    }
  }, [router]);

  const handleRestart = () => {
    window.localStorage.removeItem(CIC_DIAGNOSTIC_STORAGE_KEY);
    router.replace("/diagnostics/cic");
  };

  if (!hasChecked || !diagnosticState) return <ResultLoader />;

  return (
    <ResultSummary
      responses={diagnosticState.responses}
      onRestart={handleRestart}
    />
  );
}

const ResultLoader = () => (
  <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white px-6 font-serif text-brand-dark">
    <div className="w-full max-w-md rounded-lg border border-brand-dark/12 bg-white p-7 text-center shadow-[0_20px_60px_rgba(4,42,43,0.06)]">
      <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-brand-accent" />
      <p className="mt-5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
        CIC Diagnostic
      </p>
      <h1 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
        Preparing your workplace profile
      </h1>
      <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
        Reading your saved diagnostic and rebuilding the team pattern summary.
      </p>
    </div>
  </main>
);
