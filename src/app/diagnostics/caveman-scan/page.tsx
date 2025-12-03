"use client";

import { useState } from "react";
import CavemanScanIntro from "./CavemanScanIntro";
import CavemanScanQuestion from "./CavemanScanQuestion";
import CavemanScanResult from "./CavemanScanResult";
import ScanScienceModal from "./ScanScienceModal";
import { questionsBank } from "./questionsBank";

export default function CavemanScanPage() {
  const [stage, setStage] = useState<"intro" | "questions" | "result">("intro");
  const [current, setCurrent] = useState(0);

  const [responses, setResponses] = useState<
    { type: "caveman" | "modern"; reflection: string; science: any }[]
  >([]);

  const [scienceModalOpen, setScienceModalOpen] = useState(false);
  const [scienceContent, setScienceContent] = useState<any>(null);

  const total = questionsBank.length;

  const handleStart = () => {
    setStage("questions");
  };

  const handleSelect = (response: {
    type: "caveman" | "modern";
    reflection: string;
    science: any;
  }) => {
    const updated = [...responses];
    updated[current] = response;
    setResponses(updated);
  };

  const handleNext = () => {
    if (current + 1 < total) {
      setCurrent((c) => c + 1);
    } else {
      setStage("result");
    }
  };

  const handlePrevious = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* INTRO */}
      {stage === "intro" && <CavemanScanIntro onStart={handleStart} />}

      {/* QUESTIONS */}
      {stage === "questions" && (
        <>
          <CavemanScanQuestion
            question={questionsBank[current]}
            selected={
              responses[current]
                ? {
                    label: "selected",
                    type: responses[current].type,
                    reflection: responses[current].reflection,
                    science: responses[current].science,
                  }
                : null
            }
            setSelected={(opt) =>
              handleSelect({
                type: opt.type,
                reflection: opt.reflection,
                science: typeof opt.science === "object" ? opt.science : null,
              })
            }
            onNext={handleNext}
            onPrevious={handlePrevious}
            onShowScience={() => {
              const sci = responses[current]?.science;
              if (sci) {
                setScienceContent(sci);
                setScienceModalOpen(true);
              }
            }}
            progress={current + 1}
            total={total}
          />

          <ScanScienceModal
            open={scienceModalOpen}
            content={scienceContent}
            onClose={() => setScienceModalOpen(false)}
          />
        </>
      )}

      {/* RESULT */}
      {stage === "result" && <CavemanScanResult responses={responses} />}
    </div>
  );
}
