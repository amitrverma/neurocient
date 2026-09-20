"use client";

import { type ReactNode } from "react";
import { ArrowRight, BriefcaseBusiness, Eye, MessageSquareText } from "lucide-react";

interface Props {
  onStart: () => void;
}

const DiagnosticIntro = ({ onStart }: Props) => {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-white px-6 py-14 font-serif text-brand-dark md:py-20">
      <section className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div>
          <div className="mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
            <span>Workplace diagnostic</span>
            <span className="h-px flex-1 bg-brand-dark/15" />
          </div>

          <h1 className="max-w-4xl text-[clamp(2.65rem,5.2vw,5.25rem)] font-bold leading-[1] tracking-[-0.025em] text-brand-dark">
            Caveman in
            <br />
            <span className="italic text-brand-accent">the Cubicle</span>
          </h1>

          <p className="mt-7 max-w-2xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark md:text-lg md:leading-8">
            A professional diagnostic for spotting the ancient instincts behind
            modern workplace misfires: missed ownership, softened dissent,
            status pressure, energy drain, and execution drift.
          </p>

          <div className="mt-8 space-y-2.5 font-sans text-base font-semibold leading-7 text-brand-dark md:text-lg md:leading-8">
            <p>Why does alignment unravel after the meeting?</p>
            <p>Why do capable teams avoid the obvious conversation?</p>
            <p>Why does busyness replace meaningful progress?</p>
          </div>

          <p className="mt-8 max-w-2xl font-sans text-base leading-8 text-brand-dark/78">
            You will answer 11 workplace scenarios. Each answer names a likely
            behavioral instinct, then the summary shows the dominant motives
            shaping your team dynamics.
          </p>

          <button
            onClick={onStart}
            className="mt-9 inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-7 py-3.5 font-sans text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            Start CIC diagnostic
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <aside className="rounded-lg border border-brand-dark/10 bg-white p-6 shadow-[0_20px_60px_rgba(4,42,43,0.06)] md:p-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
            What this reveals
          </p>
          <div className="mt-6 space-y-6">
            <IntroStep
              icon={<BriefcaseBusiness className="h-5 w-5" />}
              title="Workplace scenarios"
              text="Each prompt is built around real team friction: planning, ownership, trust, energy, decisions, and execution."
            />
            <IntroStep
              icon={<Eye className="h-5 w-5" />}
              title="Immediate read"
              text="After each choice, the diagnostic names the instinct that may be shaping the behavior."
            />
            <IntroStep
              icon={<MessageSquareText className="h-5 w-5" />}
              title="Professional next steps"
              text="The result translates instincts into practical team design moves, not personality labels."
            />
          </div>
        </aside>
      </section>
    </main>
  );
};

const IntroStep = ({
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

export default DiagnosticIntro;
