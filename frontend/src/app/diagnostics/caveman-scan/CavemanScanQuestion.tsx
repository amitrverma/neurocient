"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BatteryLow, BookOpen, CheckSquare2, ChevronDown, Clock3, Footprints, House, Mail, MessageCircle, Play, Utensils } from "lucide-react";
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
    scenarioRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    setFeedbackOpen(false);
  }, [question.id]);

  return (
    <main
      ref={scenarioRef}
      tabIndex={-1}
      className="caveman-scan-page min-h-screen bg-[#f8f6f0] font-serif text-brand-dark outline-none"
    >
      <section className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-6xl flex-col px-5 pb-8 pt-6 sm:px-6 md:pb-10 md:pt-8">
        <div className="mx-auto w-full max-w-[39rem]">
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

        <div className="mx-auto w-full max-w-[39rem] pb-6 pt-7 md:pb-8 md:pt-8">
          {question.scene && question.prompt ? (
            <div>
              {question.timeLabel ? (
                <p className="mb-5 font-sans text-sm font-medium uppercase tracking-[0.16em] text-[#9d896a] sm:text-[0.95rem]">
                  {question.timeLabel}
                </p>
              ) : null}
              <div className="space-y-3.5 md:space-y-4">
                {question.scene.map((paragraph, index) => (
                  <div key={paragraph}>
                    <p
                      className={
                        question.visual
                          ? index === question.calloutIndex
                            ? "mt-2 border-l-[3px] border-[#c97a20] py-0.5 pl-4 text-[1.05rem] leading-[1.55] text-brand-dark/82 sm:pl-5 sm:text-[1.12rem] md:text-[1.2rem]"
                            : index === 0
                              ? "text-[1.08rem] font-normal leading-[1.55] tracking-[-0.008em] sm:text-[1.18rem] md:text-[1.25rem]"
                              : index === 1 && question.timeLabel
                                ? "text-[1.35rem] font-bold leading-[1.3] tracking-[-0.015em] sm:text-[1.48rem]"
                                : "text-[1.05rem] leading-[1.6] text-brand-dark/82 sm:text-[1.12rem] md:text-[1.2rem]"
                          : index === 0
                            ? "text-[1.3rem] font-bold leading-[1.35] tracking-[-0.015em] sm:text-[1.45rem] md:text-[1.7rem] md:leading-[1.3]"
                            : index === question.scene!.length - 1
                              ? "pt-1 text-[1.08rem] font-bold leading-[1.5] text-brand-dark/85 sm:text-[1.16rem] md:text-[1.28rem]"
                              : "max-w-[44rem] font-sans text-[0.94rem] leading-7 text-brand-dark/70 sm:text-base sm:leading-8 md:text-[1.05rem]"
                      }
                    >
                      <EmphasizedText
                        text={paragraph}
                        phrases={question.sceneEmphasis?.[index]}
                      />
                    </p>
                    {index === (question.visualAfter ?? 0) && question.visual ? (
                      <ScenarioVisual visual={question.visual} />
                    ) : null}
                  </div>
                ))}
              </div>
              <div className={`h-0.5 w-12 bg-brand-dark ${question.visual ? "mt-8" : "mt-5"}`} aria-hidden="true" />
              <h1 className="mt-5 text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2rem] md:text-[2.25rem]">
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
          className="mx-auto mt-auto flex flex-col items-center gap-1 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-dark/48 transition hover:text-brand-teal"
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
            {displayedOptions.map((opt, index) => {
              const isSelected = selected?.label === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => {
                    setSelected(opt);
                    setFeedbackOpen(true);
                  }}
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

          <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={onPrevious}
              disabled={progress === 1}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark/70 transition hover:border-brand-teal hover:text-brand-teal disabled:pointer-events-none disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>
            <div className="ml-auto flex items-center gap-3">
              {selected ? (
              <button
                onClick={() => setFeedbackOpen(true)}
                className="cursor-pointer font-sans text-sm font-semibold text-brand-primary transition hover:text-brand-accent"
              >
                Review explanation
              </button>
              ) : null}
              <button
                onClick={onNext}
                disabled={!selected}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-30"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {selected ? (
        <CavemanScanFeedback
          open={feedbackOpen}
          reflection={selected.reflection}
          science={typeof selected.science === "object" ? selected.science : null}
          onClose={() => setFeedbackOpen(false)}
          onContinue={onNext}
        />
      ) : null}
    </main>
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

const ScenarioVisual = ({
  visual,
}: {
  visual: NonNullable<ScanQuestion["visual"]>;
}) => visual.type === "mail-notification" ? (
  <figure className="my-6 sm:my-7">
    <figcaption className="mb-3 text-center font-serif text-[0.9rem] italic leading-6 text-[#c66a1a] sm:text-base">
      {visual.caption}
    </figcaption>
    <div className="mx-auto flex w-full max-w-[17rem] items-center gap-3 rounded-xl border border-[#ddd5c8] bg-white px-4 py-3 shadow-[0_12px_26px_rgba(91,71,42,0.09)] sm:max-w-[19rem]">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#d67b24] text-white">
        <Mail className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 font-sans">
        <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-brand-dark/45">
          {visual.app}
        </span>
        <span className="block text-sm font-semibold text-brand-dark">
          {visual.message}
        </span>
      </span>
      <span className="grid h-6 min-w-6 place-items-center rounded-full bg-brand-accent px-1.5 font-sans text-[0.65rem] font-bold text-white">
        {visual.count}
      </span>
    </div>
  </figure>
) : (
  <figure className="my-5 sm:my-6">
    <figcaption className="mb-4 text-left font-serif text-base italic leading-7 text-[#c66a1a] sm:text-lg">
      {visual.caption}
    </figcaption>
    <div className="mx-auto flex w-full max-w-[21rem] items-center gap-3 rounded-2xl border border-brand-dark/10 bg-white px-4 py-3.5 shadow-[0_14px_34px_rgba(4,42,43,0.1)]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-teal/12 text-brand-primary">
        <MomentIcon name={visual.icon} />
      </span>
      <span className="min-w-0 flex-1 font-sans">
        <span className="block text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-brand-dark/45">{visual.app}</span>
        <span className="mt-0.5 block text-sm font-semibold leading-5 text-brand-dark">{visual.message}</span>
        {visual.detail ? <span className="mt-0.5 block text-xs leading-5 text-brand-dark/55">{visual.detail}</span> : null}
      </span>
    </div>
  </figure>
);

const MomentIcon = ({ name }: { name?: NonNullable<ScanQuestion["visual"]>["icon"] }) => {
  const className = "h-5 w-5";
  if (name === "home") return <House className={className} aria-hidden="true" />;
  if (name === "play") return <Play className={className} aria-hidden="true" />;
  if (name === "chat") return <MessageCircle className={className} aria-hidden="true" />;
  if (name === "shoe") return <Footprints className={className} aria-hidden="true" />;
  if (name === "check") return <CheckSquare2 className={className} aria-hidden="true" />;
  if (name === "dinner") return <Utensils className={className} aria-hidden="true" />;
  if (name === "book") return <BookOpen className={className} aria-hidden="true" />;
  if (name === "battery") return <BatteryLow className={className} aria-hidden="true" />;
  return <Clock3 className={className} aria-hidden="true" />;
};

export default CavemanScanQuestion;
