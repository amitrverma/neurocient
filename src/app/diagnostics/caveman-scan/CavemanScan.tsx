"use client";

import { useState } from "react";
import { questionsBank } from "./questionsBank";  // ✅ Correct import

import CavemanScanIntro from "./CavemanScanIntro";
import CavemanScanQuestion from "./CavemanScanQuestion";
import CavemanScanResult from "./CavemanScanResult";
import ScanScienceModal from "./ScanScienceModal";

import type { ScanOption, ScanScienceBlock } from "./questionsBank";

type Stage = "intro" | "questions" | "result";

export default function CavemanScan() {
  const [stage, setStage] = useState<Stage>("intro");
  const [current, setCurrent] = useState(0);

  const total = questionsBank.length;

  const [responses, setResponses] = useState<
    { type: "caveman" | "modern"; reflection: string; science: ScanScienceBlock | null }[]
  >([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [scienceToShow, setScienceToShow] = useState<ScanScienceBlock | null>(null);

  const question = questionsBank[current];

  /* --------------------------
        ON SELECT
  --------------------------- */
  const handleSelect = (opt: ScanOption) => {
    const copy = [...responses];
    copy[current] = {
      type: opt.type,
      reflection: opt.reflection,
      science: typeof opt.science === "object" ? opt.science : null,
    };
    setResponses(copy);
  };

  /* --------------------------
        NEXT / PREVIOUS
  --------------------------- */
  const handleNext = () => {
    if (!responses[current]) return;

    if (current + 1 < total) {
      setCurrent((c) => c + 1);
    } else {
      setStage("result");
    }
  };

  const handlePrevious = () => {
    if (current === 0) return;
    setCurrent((c) => c - 1);
  };

  /* --------------------------
         RENDER
  --------------------------- */
  return (
    <>
      {/* INTRO */}
      {stage === "intro" && (
        <CavemanScanIntro onStart={() => setStage("questions")} />
      )}

      {/* QUESTION FLOW */}
      {stage === "questions" && (
        <>
          <CavemanScanQuestion
            question={question}
            selected={
              responses[current]
                ? {
                    label: "selected",  // not used in UI, but required by type
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
            total={total}   // ✅ Added total for progress bar
          />

          <ScanScienceModal
            open={modalOpen}
            content={scienceToShow}
            onClose={() => setModalOpen(false)}
          />
        </>
      )}

      {/* SUMMARY */}
      {stage === "result" && <CavemanScanResult responses={responses} />}
    </>
  );
}
