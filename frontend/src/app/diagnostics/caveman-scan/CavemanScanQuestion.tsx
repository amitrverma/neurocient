"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { ScanQuestion, ScanOption } from "./questionsBank";
import CavemanScanFeedback from "./CavemanScanFeedback";

interface Props {
  question: ScanQuestion;
  selected: ScanOption | null;
  setSelected: (opt: ScanOption) => void;
  onNext: () => void;
  onPrevious: () => void;
  progress: number;
  total: number;
}

const CavemanScanQuestion = ({
  question,
  selected,
  setSelected,
  onNext,
  onPrevious,
  progress,
  total,
}: Props) => {
  const scenarioRef = useRef<HTMLElement>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const displayedOptions = useMemo(
    () => shuffledOptions(question.options, question.id),
    [question.id, question.options],
  );

  useEffect(() => {
    setFeedbackOpen(false);
  }, [question.id]);

  useLayoutEffect(() => {
    if (feedbackOpen) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    scenarioRef.current?.focus({ preventScroll: true });
  }, [feedbackOpen, question.id]);

  return (
    <>
    <main
      ref={scenarioRef}
      tabIndex={-1}
      className="surface-page caveman-scan-page min-h-[calc(100svh-4rem)] outline-none"
    >
      <header className="scan-progress-header sticky top-16 z-20 border-b border-brand-dark/8 px-5 py-4 backdrop-blur sm:px-6">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-4">
          <button
            type="button"
            onClick={onPrevious}
            disabled={progress === 1}
            aria-label="Previous moment"
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-brand-dark/15 text-brand-dark/65 transition hover:border-brand-teal hover:text-brand-teal disabled:pointer-events-none disabled:opacity-25"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3 font-sans text-[0.66rem] font-semibold uppercase tracking-[0.16em]">
              <span className="text-brand-dark/55">{progress} of {total}</span>
              <span className="text-brand-teal">Inner Caveman Scan</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-brand-dark/10">
              <div
                className="h-full rounded-full bg-brand-primary transition-all duration-500"
                style={{ width: `${(progress / total) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-5xl px-5 pb-8 pt-8 sm:px-6 sm:pb-12 sm:pt-10 lg:pb-14 lg:pt-12">
        <article className="relative mx-auto max-w-3xl rounded-lg border border-brand-dark/10 bg-[var(--surface-white)] p-5 shadow-[0_14px_36px_rgba(4,42,43,0.055)] sm:p-6 lg:p-7">
          <span className="absolute left-5 top-0 -translate-y-1/2 bg-[var(--surface-paper)] px-2 font-sans text-[0.65rem] font-bold uppercase tracking-[0.16em] text-brand-teal sm:left-6">
            Situation {String(progress).padStart(2, "0")}
          </span>
          {question.scene && question.prompt ? (
            <div>
              <div className="space-y-3 sm:space-y-3.5">
                {question.scene.map((paragraph, index) => (
                  <div key={paragraph}>
                    <p
                      className={
                        question.visual
                          ? index === question.calloutIndex
                            ? "mt-3 max-w-[42rem] border-l-2 border-brand-secondary bg-white/55 py-2 pl-4 pr-3 font-sans text-[0.92rem] leading-7 text-brand-dark/72 sm:text-[0.96rem]"
                            : index === 0
                              ? "max-w-[42rem] text-[1.12rem] font-normal leading-[1.5] sm:text-[1.24rem]"
                              : index === 1 && question.timeLabel
                                ? "max-w-[42rem] text-[1.04rem] font-bold leading-[1.45] sm:text-[1.14rem]"
                                : "max-w-[42rem] font-sans text-[0.94rem] leading-7 text-brand-dark/68 sm:text-[0.98rem]"
                          : index === 0
                            ? "max-w-[42rem] text-[1.16rem] font-bold leading-[1.45] sm:text-[1.32rem]"
                            : index === question.scene!.length - 1
                              ? "max-w-[42rem] pt-0.5 text-[1rem] font-bold leading-[1.5] text-brand-dark/82 sm:text-[1.06rem]"
                              : "max-w-[42rem] font-sans text-[0.94rem] leading-7 text-brand-dark/66 sm:text-[0.98rem]"
                      }
                    >
                      {index === 0 && question.timeLabel ? (
                        <span className="font-normal text-brand-dark">
                          {question.timeLabel}.{" "}
                        </span>
                      ) : null}
                      <EmphasizedText
                        text={paragraph}
                        phrases={question.sceneEmphasis?.[index]}
                      />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <h2 className="max-w-4xl text-2xl font-bold leading-tight tracking-[-0.015em] md:text-4xl">
              {question.text}
            </h2>
          )}
        </article>

        <h1 id="scan-prompt" className="mx-auto mt-7 max-w-3xl text-[1.85rem] font-bold leading-[1.16] tracking-[-0.02em] sm:mt-9 sm:text-[2.2rem] lg:text-[2.55rem]">
            {question.prompt ?? question.text}
        </h1>

        <section aria-labelledby="scan-prompt" className="mt-6 sm:mt-7">
          <div className="mx-auto grid max-w-3xl gap-2.5">
            {displayedOptions.map((opt) => {
              const isSelected = selected?.label === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => {
                    setSelected(opt);
                    setFeedbackOpen(true);
                  }}
                  aria-pressed={isSelected}
                  className={`group grid min-h-12 w-full cursor-pointer grid-cols-[1.5rem_1fr] items-start gap-2.5 rounded-lg border px-4 py-3 text-left font-sans text-[0.9rem] leading-6 shadow-sm transition sm:px-4 sm:py-3.5 sm:text-[0.95rem] ${
                    isSelected
                      ? "border-brand-primary bg-brand-secondary/16 shadow-[0_10px_28px_rgba(4,42,43,0.07)]"
                      : "border-brand-dark/10 bg-white/80 hover:border-brand-teal/55 hover:bg-white"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid h-5 w-5 place-items-center rounded-full border ${
                      isSelected
                        ? "border-brand-primary bg-brand-primary text-white"
                        : "border-brand-dark/20 text-brand-dark/45 transition group-hover:border-brand-teal group-hover:text-brand-teal"
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-current opacity-35" />}
                  </span>
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mx-auto mt-6 flex max-w-3xl items-center justify-between gap-3 font-sans">
            <button
              type="button"
              onClick={onPrevious}
              disabled={progress === 1}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-brand-dark/15 bg-white/70 px-5 py-2.5 text-sm font-semibold text-brand-dark/70 transition hover:border-brand-teal hover:text-brand-teal disabled:pointer-events-none disabled:opacity-35"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!selected}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-35"
            >
              Next
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

        </section>
      </section>
    </main>
    {selected ? (
      <CavemanScanFeedback
        open={feedbackOpen}
        reflection={selected.reflection}
        science={typeof selected.science === "object" ? selected.science : null}
        onClose={() => setFeedbackOpen(false)}
        onContinue={onNext}
      />
    ) : null}
    </>
  );
};

const shuffledOptions = (options: ScanOption[], scenarioId: number) => {
  const shuffled = [...options];
  let seed = scenarioId * 0x9e3779b1;
  const random = () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
};

const EmphasizedText = ({
  text,
  phrases = [],
}: {
  text: string;
  phrases?: string[];
}) => {
  if (phrases.length === 0) return text;

  const pattern = new RegExp(
    `(${phrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "g",
  );

  return text.split(pattern).map((part, index) =>
    phrases.includes(part) ? (
      <strong
        key={`${part}-${index}`}
        className={
          part.includes("aroma")
            ? "font-normal italic text-brand-dark/62"
            : part.startsWith("None of it")
              ? "font-semibold text-brand-accent"
              : "font-semibold text-brand-dark"
        }
      >
        {part}
      </strong>
    ) : (
      part
    ),
  );
};

export default CavemanScanQuestion;
