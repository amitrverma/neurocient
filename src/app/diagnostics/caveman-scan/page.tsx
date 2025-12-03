"use client";

import { useState, useEffect } from "react";
import CavemanScanIntro from "./CavemanScanIntro";
import CavemanScanQuestion from "./CavemanScanQuestion";
import CavemanScanResult from "./CavemanScanResult";
import ScanScienceModal from "./ScanScienceModal";
import { questionsBank } from "./questionsBank";
import AuthModal from "../../components/AuthModal";
import { useAuth } from "@/app/context/AuthContext";

import type { ScanOption } from "./questionsBank";

type ResponseItem = {
  type: "caveman" | "modern";
  reflection: string;
  science: any;
};

export default function CavemanScanPage() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [stage, setStage] = useState<"intro" | "questions" | "result">("intro");
  const [current, setCurrent] = useState(0);

  const [responses, setResponses] = useState<ResponseItem[]>([]);

  const [scienceModalOpen, setScienceModalOpen] = useState(false);
  const [scienceContent, setScienceContent] = useState<any>(null);

  const total = questionsBank.length;

  // When trying to access result but not logged in
  useEffect(() => {
    if (stage === "result" && !user) {
      setAuthModalOpen(true);
    }
  }, [stage, user]);

  const handleStart = () => setStage("questions");

  const handleSelect = (opt: ScanOption) => {
    const updated = [...responses];
    updated[current] = {
      type: opt.type,
      reflection: opt.reflection,
      science: opt.science ?? null,
    };
    setResponses(updated);
  };

  const handleNext = () => {
    if (current + 1 < total) {
      setCurrent((c) => c + 1);
      return;
    }

    // If last question → require login
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setStage("result");
  };

  const handlePrevious = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  // Build proper ScanOption object for selected prop
  const selectedOption = responses[current]
    ? {
        label:
          questionsBank[current].options.find(
            (o) => o.type === responses[current].type
          )?.label || "",
        type: responses[current].type,
        reflection: responses[current].reflection,
        science: responses[current].science,
      }
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* INTRO */}
      {stage === "intro" && <CavemanScanIntro onStart={handleStart} />}

      {/* QUESTIONS */}
      {stage === "questions" && (
        <>
          <CavemanScanQuestion
            question={questionsBank[current]}
            selected={selectedOption}
            setSelected={handleSelect}
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
      {stage === "result" && user && (
        <CavemanScanResult responses={responses} />
      )}

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        context="view your results"
        onSuccess={() => {
          setAuthModalOpen(false);
          setStage("result"); // now allowed
        }}
      />
    </div>
  );
}
