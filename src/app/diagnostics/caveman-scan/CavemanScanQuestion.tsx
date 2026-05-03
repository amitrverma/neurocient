"use client";

import { useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ScanQuestion, ScanOption } from "./questionsBank";
import CavemanScanFeedback from "./CavemanScanFeedback";

interface Props {
  question: ScanQuestion;
  selected: ScanOption | null;
  setSelected: (opt: ScanOption) => void;
  onNext: () => void;
  onPrevious: () => void;
  onShowScience: () => void;
  progress: number;
  total: number;
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
    // Reserved for future per-question side effects.
  }, [question.id]);

  return (
    <main className="min-h-screen bg-white px-6 py-10 font-serif text-brand-dark md:py-14">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark">
            <span>
              {progress} of {total}
            </span>
            <span className="text-brand-teal">Inner Caveman Scan</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-brand-dark/10">
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-500"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
          <span>Scenario</span>
          <span className="h-px flex-1 bg-brand-dark/15" />
        </div>

        <h1 className="w-full text-2xl font-bold leading-tight tracking-[-0.015em] text-brand-dark md:text-4xl">
          {question.text}
        </h1>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              Choose the response closest to you
            </p>

            <div className="space-y-3">
              {question.options.map((opt, index) => {
                const isSelected = selected?.label === opt.label;

                return (
                  <button
                    key={index}
                    onClick={() => setSelected(opt)}
                    className={`w-full cursor-pointer rounded-lg border px-5 py-4 text-left font-sans text-[0.82rem] leading-6 shadow-sm transition md:text-sm ${
                      isSelected
                        ? "border-brand-dark bg-brand-dark text-white"
                        : "border-brand-dark/10 bg-white text-brand-dark hover:border-brand-teal/60 hover:shadow-md"
                    }`}
                  >
                    <span
                      className={`mb-2 block text-xs font-semibold uppercase tracking-[0.14em] ${
                        isSelected ? "text-brand-secondary" : "text-brand-teal"
                      }`}
                    >
                      Option {index + 1}
                    </span>
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-7 flex items-center justify-between gap-3">
              <button
                onClick={onPrevious}
                disabled={progress === 1}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-teal hover:text-brand-teal disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                onClick={onNext}
                disabled={!selected}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-35"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="lg:pt-[2.1rem]">
            {selected ? (
              <CavemanScanFeedback
                reflection={selected.reflection}
                science={
                  typeof selected.science === "object" ? selected.science : null
                }
                onShowScience={onShowScience}
              />
            ) : (
              <div className="rounded-lg border border-brand-dark/10 bg-white p-6 shadow-sm">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                  Reflection appears here
                </p>
                <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
                  Pick a response to see what might be driving it underneath.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default CavemanScanQuestion;
