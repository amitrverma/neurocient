"use client";

import { useEffect } from "react";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
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
    <main className="caveman-scan-page min-h-screen bg-[#f8f6f0] font-serif text-brand-dark">
      <section className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-5xl flex-col px-6 pb-7 pt-8 md:pb-9 md:pt-10">
        <div>
          <div className="mb-3 flex items-center justify-between gap-4 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.17em] text-brand-dark/58">
            <span>{progress} of {total}</span>
            <span className="text-brand-teal">Inner Caveman Scan</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-brand-dark/10">
            <div
              className="h-full rounded-full bg-brand-primary transition-all duration-500"
              style={{ width: `${(progress / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="my-auto py-10 md:py-14">
          {question.scene && question.prompt ? (
            <div className="max-w-4xl">
              <div className="max-w-3xl space-y-4 md:space-y-5">
                {question.scene.map((paragraph, index) => (
                  <p
                    key={paragraph}
                    className={
                      index === 0
                        ? "text-[1.3rem] font-bold leading-[1.35] tracking-[-0.015em] sm:text-[1.45rem] md:text-[1.7rem] md:leading-[1.3]"
                        : index === question.scene!.length - 1
                          ? "pt-1 text-[1.08rem] font-bold leading-[1.5] text-brand-dark/85 sm:text-[1.16rem] md:text-[1.28rem]"
                          : "max-w-[44rem] font-sans text-[0.94rem] leading-7 text-brand-dark/70 sm:text-base sm:leading-8 md:text-[1.05rem]"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <h1 className="mt-6 max-w-3xl text-[1.75rem] font-bold leading-[1.15] tracking-[-0.025em] sm:text-[2rem] md:mt-7 md:text-[2.65rem]">
                {question.prompt}
              </h1>
            </div>
          ) : (
            <h1 className="max-w-4xl text-2xl font-bold leading-tight tracking-[-0.015em] md:text-4xl">
              {question.text}
            </h1>
          )}
        </div>

        <a
          href="#scan-choices"
          className="mx-auto flex flex-col items-center gap-1 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-dark/48 transition hover:text-brand-teal"
        >
          <span>Stay with it for a moment</span>
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </a>
      </section>

      <section id="scan-choices" className="scroll-mt-20 border-y border-brand-dark/10 bg-white px-6 py-12 md:py-16">
        <div className="mx-auto w-full max-w-3xl">
          <p className="mb-6 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.19em] text-brand-primary">
            Which feels closest?
          </p>

          <div className="border-t border-brand-dark/12">
            {question.options.map((opt, index) => {
              const isSelected = selected?.label === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => setSelected(opt)}
                  aria-pressed={isSelected}
                  className={`group grid w-full cursor-pointer grid-cols-[2rem_1fr] items-start gap-3 border-b border-l-2 py-5 pl-3 pr-2 text-left font-sans text-[0.93rem] leading-7 transition sm:grid-cols-[2.25rem_1fr] sm:gap-4 sm:py-6 sm:pl-4 sm:text-base ${
                    isSelected
                      ? "border-b-brand-dark/12 border-l-brand-primary bg-brand-secondary/15"
                      : "border-b-brand-dark/12 border-l-transparent hover:border-l-brand-teal hover:bg-brand-teal/[0.035]"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid h-7 w-7 place-items-center rounded-full border text-[0.65rem] font-bold ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary text-white"
                        : "border-brand-dark/20 text-brand-dark/45 transition group-hover:border-brand-teal group-hover:text-brand-teal"
                    }`}
                    aria-hidden="true"
                  >
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {!selected ? (
            <button
              onClick={onPrevious}
              disabled={progress === 1}
              className="mt-7 inline-flex cursor-pointer items-center gap-2 font-sans text-sm font-semibold text-brand-dark/58 transition hover:text-brand-teal disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
          ) : null}
        </div>
      </section>

      {selected ? (
        <section className="bg-[#f8f6f0] px-6 py-12 md:py-16">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-8 border-l-2 border-brand-primary pl-5">
              <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-brand-primary">
                You chose
              </p>
              <p className="mt-3 max-w-3xl text-xl font-bold leading-8 md:text-2xl md:leading-9">
                {selected.label}
              </p>
            </div>

            <CavemanScanFeedback
              reflection={selected.reflection}
              science={typeof selected.science === "object" ? selected.science : null}
              onShowScience={onShowScience}
            />

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                onClick={onPrevious}
                disabled={progress === 1}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold transition hover:border-brand-teal hover:text-brand-teal disabled:pointer-events-none disabled:opacity-35"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              <button
                onClick={onNext}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
};

export default CavemanScanQuestion;
