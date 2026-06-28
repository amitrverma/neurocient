import { ArrowLeft } from "lucide-react";
import { stepMeta } from "../_lib/flowSteps";
import type { Step } from "../_lib/types";

export const PracticeHeader = ({
  progress,
  step,
  onBack,
}: {
  progress: number;
  step: Step;
  onBack: () => void;
}) => (
  <header className="flex items-center justify-between gap-4 border-b border-brand-dark/10 pb-4 font-sans">
    <button
      type="button"
      onClick={step === "welcome" ? undefined : onBack}
      disabled={step === "welcome"}
      className="inline-flex min-h-10 items-center gap-2 rounded-full px-1 text-sm font-medium text-brand-dark/55 transition hover:text-brand-dark disabled:pointer-events-none disabled:opacity-0"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back
    </button>

    <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
      <span className="hidden text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal sm:inline">
        Practice
      </span>
      <div className="h-px w-full max-w-44 bg-brand-dark/10" />
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
        {stepMeta[step] ?? "Start"}
      </span>
    </div>

    <div className="w-16 text-right text-xs font-semibold text-brand-teal">
      {progress}%
    </div>
  </header>
);
