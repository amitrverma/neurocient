"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { questionsBank } from "./questionsBank";

import CavemanScanIntro from "./CavemanScanIntro";
import CavemanScanQuestion from "./CavemanScanQuestion";
import CavemanScanResult from "./CavemanScanResult";
import ScanScienceModal from "./ScanScienceModal";
import AuthModal from "@/app/components/AuthModal";
import { useAuth } from "@/app/context/AuthContext";

import type { ScanOption, ScanScienceBlock } from "./questionsBank";
import {
  CAVEMAN_SCAN_STORAGE_KEY,
  isCavemanScanStage,
  type CavemanScanResponse,
  type CavemanScanStage,
  type CavemanScanState,
} from "./scanStorage";

export default function CavemanScan() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [stage, setStage] = useState<CavemanScanStage>("intro");
  const [current, setCurrent] = useState(0);
  const [hasRestored, setHasRestored] = useState(false);
  const [showResultAuth, setShowResultAuth] = useState(false);

  const total = questionsBank.length;

  const [responses, setResponses] = useState<CavemanScanResponse[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [scienceToShow, setScienceToShow] =
    useState<ScanScienceBlock | null>(null);

  const question = questionsBank[current];

  useEffect(() => {
    if (!ready) return;

    try {
      const saved = window.localStorage.getItem(CAVEMAN_SCAN_STORAGE_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved) as {
        stage?: unknown;
        current?: unknown;
        responses?: unknown;
      };

      if (isCavemanScanStage(parsed.stage)) {
        if (parsed.stage === "result") {
          if (user) {
            router.replace("/diagnostics/caveman-scan/result");
          } else {
            setShowResultAuth(true);
          }
          return;
        }

        setStage(parsed.stage);
      }
      if (typeof parsed.current === "number") {
        setCurrent(Math.min(Math.max(parsed.current, 0), total - 1));
      }
      if (Array.isArray(parsed.responses)) {
        setResponses(parsed.responses as CavemanScanResponse[]);
      }
    } catch {
      window.localStorage.removeItem(CAVEMAN_SCAN_STORAGE_KEY);
    } finally {
      setHasRestored(true);
    }
  }, [ready, router, total, user]);

  useEffect(() => {
    if (!hasRestored || showResultAuth) return;

    saveScanState({ stage, current, responses });
  }, [current, hasRestored, responses, showResultAuth, stage]);

  const handleRestart = () => {
    window.localStorage.removeItem(CAVEMAN_SCAN_STORAGE_KEY);
    setResponses([]);
    setCurrent(0);
    setStage("intro");
    setModalOpen(false);
    setScienceToShow(null);
  };

  const handleSelect = (opt: ScanOption) => {
    const copy = [...responses];
    copy[current] = {
      label: opt.label,
      type: opt.type,
      reflection: opt.reflection,
      science: typeof opt.science === "object" ? opt.science : null,
    };
    setResponses(copy);
  };

  const handleNext = () => {
    if (!responses[current]) return;

    if (current + 1 < total) {
      setCurrent((c) => c + 1);
    } else {
      saveScanState({ stage: "result", current, responses });
      if (!ready || !user) {
        setShowResultAuth(true);
        return;
      }

      router.push("/diagnostics/caveman-scan/result");
    }
  };

  const handlePrevious = () => {
    if (current === 0) return;
    setCurrent((c) => c - 1);
  };

  if (!hasRestored) return null;

  return (
    <>
      {stage === "intro" && (
        <CavemanScanIntro onStart={() => setStage("questions")} />
      )}

      {stage === "questions" && (
        <>
          <CavemanScanQuestion
            question={question}
            selected={
              responses[current]
                ? {
                    label: responses[current].label,
                    type: responses[current].type,
                    reflection: responses[current].reflection,
                    science: responses[current].science,
                  }
                : null
            }
            setSelected={handleSelect}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onShowScience={() => {
              const science = responses[current]?.science;
              if (science) {
                setScienceToShow(science);
                setModalOpen(true);
              }
            }}
            progress={current + 1}
            total={total}
          />

          <ScanScienceModal
            open={modalOpen}
            content={scienceToShow}
            onClose={() => setModalOpen(false)}
          />
        </>
      )}

      {stage === "result" && (
        <CavemanScanResult responses={responses} onRestart={handleRestart} />
      )}

      <AuthModal
        isOpen={showResultAuth}
        onClose={() => setShowResultAuth(false)}
        onSuccess={() => router.push("/diagnostics/caveman-scan/result")}
        context="see your scan result"
      />
    </>
  );
}

const saveScanState = (state: CavemanScanState) => {
  window.localStorage.setItem(CAVEMAN_SCAN_STORAGE_KEY, JSON.stringify(state));
};
