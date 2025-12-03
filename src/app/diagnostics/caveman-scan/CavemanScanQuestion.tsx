"use client";

import { useEffect } from "react";
import type { ScanQuestion, ScanOption } from "./questionsBank";
import CavemanScanFeedback from "./CavemanScanFeedback";

interface Props {
  question: ScanQuestion;
  selected: ScanOption | null;
  setSelected: (opt: ScanOption) => void;
  onNext: () => void;
  onPrevious: () => void;
  onShowScience: () => void;
  progress: number; // current question number
  total: number;    // total questions in the scan  ✅ ADDED
}

const CavemanScanQuestion = ({
  question,
  selected,
  setSelected,
  onNext,
  onPrevious,
  onShowScience,
  progress,
  total,
}: Props) => {

  useEffect(() => {
    // Could reset local state here if needed
  }, [question.id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8fafc] font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-brand-dark mb-1">
            <span>Step {progress} of {total}</span>
            <span className="font-semibold text-brand-primary">Caveman Scan</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-500 bg-brand-primary"
              style={{ width: `${(progress / total) * 100}%` }}  // ✅ FIXED
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold text-brand-dark mb-2">
          {question.text}
        </h2>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* LEFT: Options */}
          <div>
            <ul className="space-y-3 mb-6">
              {question.options.map((opt, index) => (
                <li key={index}>
                  <button
                    onClick={() => setSelected(opt)}
                    className={`w-full text-left px-4 py-3 rounded-lg border shadow-sm transition duration-150
                      ${
                        selected?.label === opt.label
                          ? "border-brand-teal ring-1 ring-brand-teal/70"
                          : "bg-white text-brand-dark border-brand-dark hover:bg-brand-secondary/20"
                      }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={onPrevious}
                className="px-4 py-2 border text-brand-dark rounded hover:bg-brand-teal hover:text-white transition"
              >
                ← Previous
              </button>

              <button
                onClick={onNext}
                disabled={!selected}
                className="px-4 py-2 border text-brand-dark rounded hover:bg-brand-teal hover:text-white transition disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>

          {/* RIGHT: Feedback Panel */}
          <div>
            {selected ? (
              <CavemanScanFeedback
                reflection={selected.reflection}
                science={typeof selected.science === "object" ? selected.science : null}
                onShowScience={onShowScience}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CavemanScanQuestion;
