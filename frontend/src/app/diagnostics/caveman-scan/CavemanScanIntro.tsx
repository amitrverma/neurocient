"use client";

import { type ReactNode } from "react";
import { ArrowRight, Brain, Eye, MessageSquareText } from "lucide-react";

interface Props {
  onStart: () => void;
}

const CavemanScanIntro = ({ onStart }: Props) => {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-white px-6 py-14 font-serif text-brand-dark md:py-20">
      <section className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
            <span>Diagnostic</span>
            <span className="h-px flex-1 bg-brand-dark/15" />
          </div>

          <h1 className="max-w-4xl text-[clamp(2.65rem,5.2vw,5.25rem)] font-bold leading-[1] tracking-[-0.025em] text-brand-dark">
            Your Inner
            <br />
            <span className="italic text-brand-accent">Caveman Scan</span>
          </h1>

          <p className="mt-7 max-w-2xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark md:text-lg md:leading-8">
            This scan helps you see how your Inner Caveman shows up in everyday
            decisions &mdash; the reactions behind procrastination, hesitation,
            distraction, and emotional loops.
          </p>

          <div className="mt-8 space-y-2.5 font-sans text-base font-semibold leading-7 text-brand-dark md:text-lg md:leading-8">
            <p>Why do you switch tasks even when you don&apos;t mean to?</p>
            <p>Why do some habits feel easy while others feel hard?</p>
            <p>Why do reactions take over before you can think them through?</p>
          </div>

          <p className="mt-8 max-w-2xl font-sans text-base leading-8 text-brand-dark/78">
            You&apos;ll go through a few short scenarios. After each one,
            you&apos;ll see what&apos;s driving the response.
          </p>

          <button
            onClick={onStart}
            className="mt-9 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-7 py-3.5 font-sans text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Start the scan
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <aside className="rounded-lg border border-brand-dark/10 bg-white p-6 shadow-[0_20px_60px_rgba(4,42,43,0.06)] md:p-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
            What happens inside
          </p>
          <div className="mt-6 space-y-6">
            <ScanStep
              icon={<MessageSquareText className="h-5 w-5" />}
              title="Short scenarios"
              text="Every prompt is built around a familiar moment: avoidance, comparison, friction, or emotional momentum."
            />
            <ScanStep
              icon={<Eye className="h-5 w-5" />}
              title="Immediate reflection"
              text="After you choose a response, the scan names the pattern underneath it."
            />
            <ScanStep
              icon={<Brain className="h-5 w-5" />}
              title="Optional science"
              text="When useful, you can open the deeper evolutionary explanation behind the reaction."
            />
          </div>
        </aside>
      </section>
    </main>
  );
};

const ScanStep = ({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) => (
  <div className="flex gap-4 border-l-2 border-brand-teal pl-4">
    <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
      {icon}
    </span>
    <div>
      <h2 className="font-sans text-sm font-semibold text-brand-dark">
        {title}
      </h2>
      <p className="mt-2 font-sans text-sm leading-7 text-brand-dark/72">
        {text}
      </p>
    </div>
  </div>
);

export default CavemanScanIntro;
