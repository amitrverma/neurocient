"use client";

import { useState, useEffect } from "react";
import { diagnosticQuestions } from "./questions";
import FeedbackOverlay from "./FeedbackOverlay";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../../components/AuthModal";

interface Props {
  onComplete: (responses: Record<string, string>) => void;
}

const DiagnosticQuestion = ({ onComplete }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [showAuth, setShowAuth] = useState(false);

  const { user } = useAuth(); // ✅ check login

  const question = diagnosticQuestions[currentIndex];

  useEffect(() => {
    const existing = responses[question.id];
    setSelectedOption(existing || null);
  }, [currentIndex, question.id, responses]);

  const handleSelect = (optionKey: string) => {
    setSelectedOption(optionKey);
    setResponses((prev) => ({ ...prev, [question.id]: optionKey }));
  };

  const handleNext = () => {
    if (!selectedOption) return;

    if (currentIndex + 1 < diagnosticQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // ✅ Protect finish behind login
      if (!user) {
        setShowAuth(true);
        return;
      }
      onComplete(responses);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8fafc] font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
            <span>
              Step {currentIndex + 1} of {diagnosticQuestions.length}
            </span>
            <span className="font-semibold text-[var(--color-brand-primary)]">
              Caveman at Work
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${((currentIndex + 1) / diagnosticQuestions.length) * 100}%`,
                backgroundColor: "var(--color-brand-primary)",
              }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-2xl font-bold text-[var(--color-brand-dark)] mb-2">
          {question.title}
        </h2>
        <p className="text-lg text-gray-700 mb-6 whitespace-pre-line">
          {question.question.split("?")[0] + "?"}
          {"\n"}
          <span className="block font-semibold text-[var(--color-brand-dark)] mt-2">
            {question.question.split("?")[1]?.trim()}
          </span>
        </p>

        {/* Options + Feedback side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Options + Buttons */}
          <div>
            <ul className="space-y-3 mb-6">
              {Object.entries(question.options).map(([key, value]) => (
                <li key={key}>
                  <button
                    onClick={() => handleSelect(key)}
                    className={`w-full text-left px-4 py-3 rounded-lg border shadow-sm transition duration-150
                      ${
                        selectedOption === key
                          ? "bg-[var(--color-brand-teal)] text-white border-[var(--color-brand-teal)] ring-2 ring-[var(--color-brand-teal)]/70"
                          : "bg-white text-[var(--color-brand-dark)] border-gray-300 hover:bg-[var(--color-brand-secondary)]/20"
                      }`}
                  >
                    <span className="font-semibold">{key})</span> {value}
                  </button>
                </li>
              ))}
            </ul>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              {currentIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 bg-[var(--color-brand-teal)] text-white text-sm rounded hover:bg-[var(--color-brand-accent)] transition"
                >
                  ← Previous
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={!selectedOption}
                className={`px-4 py-2 text-sm rounded transition 
                  ${
                    selectedOption
                      ? "bg-[var(--color-brand-teal)] text-white hover:bg-[var(--color-brand-accent)]"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {currentIndex + 1 === diagnosticQuestions.length
                  ? "Finish →"
                  : "Next →"}
              </button>
            </div>
          </div>

          {/* RIGHT: Feedback aligned with options */}
          <div>
            {selectedOption && (
              <FeedbackOverlay questionId={question.id} option={selectedOption} />
            )}
          </div>
        </div>
      </div>

      {/* ✅ Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false);
          onComplete(responses); // resume after login
        }}
      />
    </div>
  );
};

export default DiagnosticQuestion;
