"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { questionsBank } from "./questionsBank";

import CavemanScanIntro from "./CavemanScanIntro";
import CavemanScanQuestion from "./CavemanScanQuestion";

import type { ScanOption } from "./questionsBank";
import {
  CAVEMAN_SCAN_STORAGE_KEY,
  type CavemanScanResponse,
  type CavemanScanStage,
  type CavemanScanState,
} from "./scanStorage";

export default function CavemanScan() {
  const router = useRouter();
  const [stage, setStage] = useState<CavemanScanStage>("intro");
  const [current, setCurrent] = useState(0);
  const [hasRestored, setHasRestored] = useState(false);
  const [hasProgress, setHasProgress] = useState(false);

  const total = questionsBank.length;

  const [responses, setResponses] = useState<CavemanScanResponse[]>([]);

  const question = questionsBank[current];
  const storedResponse = responses[current];
  const selectedOption = storedResponse
    ? question.options.find(
        (option) =>
          (storedResponse.evidence?.optionId &&
            option.evidence?.optionId === storedResponse.evidence.optionId) ||
          option.label === storedResponse.label,
      ) ?? null
    : null;

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CAVEMAN_SCAN_STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as {
        stage?: unknown;
        current?: unknown;
        responses?: unknown;
      };

      if (parsed.stage === "result") {
        router.replace("/diagnostics/caveman-scan/result");
        return;
      }
      if (typeof parsed.current === "number") {
        setCurrent(Math.min(Math.max(parsed.current, 0), total - 1));
      }
      const restoredResponses = Array.isArray(parsed.responses)
        ? parsed.responses as CavemanScanResponse[]
        : [];
      if (restoredResponses.length > 0) {
        setResponses(restoredResponses);
      }
      if (
        parsed.stage === "questions" ||
        restoredResponses.length > 0 ||
        (typeof parsed.current === "number" && parsed.current > 0)
      ) {
        setHasProgress(true);
      }
    } catch {
      window.localStorage.removeItem(CAVEMAN_SCAN_STORAGE_KEY);
    } finally {
      setHasRestored(true);
    }
  }, [router, total]);

  useEffect(() => {
    if (!hasRestored) return;

    saveScanState({ stage, current, responses });
  }, [current, hasRestored, responses, stage]);

  const handleSelect = (opt: ScanOption) => {
    const copy = [...responses];
    copy[current] = {
      label: opt.label,
      type: opt.type,
      reflection: opt.reflection,
      science: typeof opt.science === "object" ? opt.science : null,
      evidence: opt.evidence,
    };
    setResponses(copy);
  };

  const handleNext = () => {
    if (!responses[current]) return;

    if (current + 1 < total) {
      setCurrent((c) => c + 1);
    } else {
      saveScanState({ stage: "result", current, responses });
      router.push("/diagnostics/caveman-scan/result");
    }
  };

  const handlePrevious = () => {
    if (current === 0) return;
    setCurrent((c) => c - 1);
  };

  const handleStart = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setStage("questions");
  };

  if (!hasRestored) {
    return (
      <main className="journey-loading">
        <div>
          <LoaderCircle className="animate-spin" aria-hidden="true" />
          <p>Preparing the first situation</p>
        </div>
      </main>
    );
  }

  return (
    <div className="caveman-scan-page">
      {stage === "intro" && (
        <CavemanScanIntro
          hasProgress={hasProgress}
          onStart={handleStart}
        />
      )}

      {stage === "questions" && (
        <>
          <CavemanScanQuestion
            question={question}
            selected={selectedOption}
            setSelected={handleSelect}
            onNext={handleNext}
            onPrevious={handlePrevious}
            progress={current + 1}
            total={total}
          />
        </>
      )}

    </div>
  );
}

const saveScanState = (state: CavemanScanState) => {
  window.localStorage.setItem(CAVEMAN_SCAN_STORAGE_KEY, JSON.stringify(state));
};
