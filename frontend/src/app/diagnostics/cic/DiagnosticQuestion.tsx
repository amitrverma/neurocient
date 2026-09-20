"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { diagnosticQuestions } from "./questions";
import FeedbackOverlay from "./FeedbackOverlay";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../../components/AuthModal";
import { trackEvent } from "@/app/utils/analytics";

interface Props {
  onComplete: (responses: Record<string, string>) => void;
}

const DiagnosticQuestion = ({ onComplete }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [showAuth, setShowAuth] = useState(false);

  const { user } = useAuth();
  const question = diagnosticQuestions[currentIndex];
  const total = diagnosticQuestions.length;

  useEffect(() => {
    const existing = responses[question.id];
    setSelectedOption(existing || null);
  }, [currentIndex, question.id, responses]);

  const handleSelect = (optionKey: string) => {
    setSelectedOption(optionKey);
    setResponses((prev) => ({ ...prev, [question.id]: optionKey }));
  };

  const completeDiagnostic = () => {
    if (!selectedOption) return;

    const completedResponses = {
      ...responses,
      [question.id]: selectedOption,
    };

    trackEvent("Diagnostic Completed", { responses: completedResponses });
    onComplete(completedResponses);
  };

  const handleNext = () => {
    if (!selectedOption) return;

    if (currentIndex + 1 < total) {
      trackEvent("Diagnostic Step Completed", {
        step: currentIndex + 1,
        questionId: question.id,
        answer: selectedOption,
      });
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    if (!user) {
      setShowAuth(true);
      return;
    }

    completeDiagnostic();
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  return (
    <main className="min-h-screen bg-white px-6 py-10 font-serif text-brand-dark md:py-14">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark">
            <span>
              {currentIndex + 1} of {total}
            </span>
            <span className="text-brand-teal">Caveman in the Cubicle</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-brand-dark/10">
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
          {question.title}
        </p>
        <h1 className="mt-3 w-full text-2xl font-bold leading-tight tracking-[-0.015em] text-brand-dark md:text-4xl">
          {question.question}
        </h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              Choose the closest team pattern
            </p>

            <div className="space-y-3">
              {Object.entries(question.options).map(([key, value]) => {
                const isSelected = selectedOption === key;

                return (
                  <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    className={`w-full cursor-pointer rounded-lg border px-5 py-4 text-left font-sans text-[0.82rem] leading-6 shadow-sm transition md:text-sm ${
                      isSelected
                        ? "border-brand-dark bg-brand-dark text-white"
                        : "border-brand-dark/10 bg-white text-brand-dark hover:border-brand-teal/60 hover:shadow-md"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              <button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-teal hover:text-brand-teal disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={!selectedOption}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-35"
              >
                {currentIndex + 1 === total ? "Finish" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="lg:pt-[2.1rem]">
            {selectedOption ? (
              <FeedbackOverlay
                questionId={question.id}
                option={selectedOption}
              />
            ) : (
              <div className="rounded-lg border border-brand-dark/10 bg-white p-6 shadow-sm">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                  Behavioral read appears here
                </p>
                <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
                  Pick a response to see the instinct that may be shaping the
                  workplace pattern.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        context="view the result"
        onSuccess={() => {
          setShowAuth(false);
          completeDiagnostic();
        }}
      />
    </main>
  );
};

export default DiagnosticQuestion;
