"use client";

import { Microscope } from "lucide-react";
import type { ScanScienceBlock } from "./questionsBank";

interface Props {
  reflection: string;
  science: ScanScienceBlock | null;
  onShowScience: () => void;
}

const CavemanScanFeedback = ({ reflection, science, onShowScience }: Props) => {
  return (
    <aside className="rounded-lg border border-brand-dark/10 bg-white p-6 text-brand-dark shadow-[0_20px_60px_rgba(4,42,43,0.06)] md:p-7">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
        What is driving this?
      </p>

      <div
        className="mt-4 space-y-3 border-l-4 border-brand-secondary pl-5 font-sans text-sm leading-7 text-brand-dark md:text-[0.95rem] md:leading-8 [&_p]:my-3 [&_strong]:text-brand-accent"
        dangerouslySetInnerHTML={{ __html: reflection }}
      />

      {science && (
        <button
          onClick={onShowScience}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
        >
          <Microscope className="h-4 w-4" />
          Want the science?
        </button>
      )}
    </aside>
  );
};

export default CavemanScanFeedback;
