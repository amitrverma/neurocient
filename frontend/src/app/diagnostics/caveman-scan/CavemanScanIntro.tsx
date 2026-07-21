"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface Props {
  onStart: () => void;
}

const CavemanScanIntro = ({ onStart }: Props) => {
  return (
    <main className="relative min-h-[calc(100vh-5rem)] overflow-hidden bg-[#f8f6f0] px-5 py-10 font-serif text-brand-dark sm:px-7 sm:py-14 lg:flex lg:items-center lg:py-20">
      <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-brand-secondary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-brand-teal/10 blur-3xl" />

      <section className="relative mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-20">
        <div className="max-w-2xl">
          <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brand-teal sm:text-xs">
            The Inner Caveman Scan <span className="mx-2 text-brand-dark/25">·</span> About 5 minutes
          </p>

          <h1 className="mt-6 max-w-[12ch] text-[clamp(3rem,12vw,5.5rem)] font-bold leading-[0.94] tracking-[-0.035em] text-brand-dark">
            Meet the part of you that acts
            <span className="block font-normal italic text-brand-accent">even before you think.</span>
          </h1>

          <p className="mt-7 max-w-[35rem] font-sans text-lg leading-8 text-brand-dark/78 sm:text-xl sm:leading-9">
            Twelve ordinary moments, slowed down just enough to notice what your
            Inner Caveman may be trying to protect.
          </p>

          <div className="mt-8 grid gap-3 border-y border-brand-dark/10 py-6 font-sans text-sm leading-6 text-brand-dark/78 sm:grid-cols-3 sm:gap-5">
            <p>The task you keep circling.</p>
            <p>The scroll that outlasts the break.</p>
            <p>The rest that never feels restful.</p>
          </div>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <button
              onClick={onStart}
              className="inline-flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-7 py-3.5 font-sans text-sm font-semibold text-white shadow-[0_10px_30px_rgba(4,42,43,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(4,42,43,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 sm:w-auto"
            >
              See what shows up
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="font-sans text-xs leading-5 text-brand-dark/55">
              No score. No right answers.
            </p>
          </div>
        </div>

        <aside className="relative mx-auto w-full max-w-lg lg:mx-0">
          <div className="absolute -inset-3 rotate-2 rounded-[2rem] border border-brand-dark/[0.06] bg-white/35" aria-hidden="true" />
          <div className="relative overflow-hidden rounded-[1.6rem] border border-brand-dark/10 bg-white/80 shadow-[0_24px_70px_rgba(4,42,43,0.08)] backdrop-blur-sm">
            <div className="border-b border-brand-dark/10 px-6 py-5 sm:px-8">
              <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-accent">
                One moment. A different reading.
              </p>
            </div>

            <div className="px-6 py-7 sm:px-8 sm:py-9">
              <p className="font-serif text-2xl leading-9 text-brand-dark sm:text-[1.75rem] sm:leading-10">
                You know what you meant to do. Your hand reaches for the phone anyway.
              </p>

              <div className="my-7 h-px bg-brand-dark/10" />

              <div className="grid gap-6 font-sans">
                <Reading number="01" label="The usual take">
                  You need more discipline. Put the phone away.
                </Reading>
                <Reading number="02" label="The Caveman take" accent>
                  Something more immediate may be offering relief before the harder thing has even begun.
                </Reading>
              </div>

              <p className="mt-8 border-l-2 border-brand-secondary pl-4 font-sans text-sm italic leading-6 text-brand-dark/66">
                The Scan looks for what repeats across moments—not what is “wrong” with you.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

const Reading = ({
  number,
  label,
  accent = false,
  children,
}: {
  number: string;
  label: string;
  accent?: boolean;
  children: ReactNode;
}) => (
  <div className="grid grid-cols-[2rem_1fr] gap-3">
    <span className={`pt-0.5 text-xs font-semibold ${accent ? "text-brand-accent" : "text-brand-teal"}`}>
      {number}
    </span>
    <div>
      <h2 className="text-sm font-semibold text-brand-dark">{label}</h2>
      <p className="mt-1.5 text-sm leading-6 text-brand-dark/68">{children}</p>
    </div>
  </div>
);

export default CavemanScanIntro;
