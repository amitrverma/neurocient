"use client";

import Link from "next/link";
import { ArrowDown, Check } from "lucide-react";
import { SectionLabel } from "../../components/landing/LandingShared";
import type { CavemanScanResponse } from "./scanStorage";
import { buildResultSummary } from "./scanResultSummary";
import ResultApproach, { resultButton } from "./ResultApproach";

export default function ScanResultStory({ responses, onUnlock, signedIn = false, ready = true }: {
  responses: CavemanScanResponse[];
  onUnlock: () => void;
  signedIn?: boolean;
  ready?: boolean;
}) {
  const result = buildResultSummary(responses);
  const cavemanAppeared = result.automaticCount > 0;

  return (
    <main className="surface-page caveman-scan-page min-h-[calc(100svh-4rem)]">
      <section className="relative px-5 pb-12 pt-10 sm:px-7 sm:pb-16 sm:pt-14 lg:pb-20">
        <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-brand-secondary/15 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <div className="page-eyebrow mb-7 flex flex-wrap items-center gap-2 text-brand-teal">
            <Check className="h-4 w-4" aria-hidden="true" /> Scan complete
            <span className="mx-1 text-brand-dark/30" aria-hidden="true">/</span> Your result
          </div>

          {cavemanAppeared ? (
            <>
              <h1 className="page-title max-w-[12ch]">
                You saw your Inner Caveman in everyday life.
              </h1>
              <div className="mt-7 max-w-2xl font-sans text-base leading-8 text-brand-dark/72 sm:text-lg sm:leading-9">
                <p>
                  The Scan placed everyday situations beside an Inner Caveman reading:
                  the evolved automatic processing that can shape what happens next.
                </p>
              </div>
              <div className="mt-10 max-w-4xl">
                <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-accent">
                  What you saw at work
                </p>
                <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 font-sans text-sm font-semibold sm:grid-cols-3">
                  {["Immediate reward", "Effort and delay", "Uncertainty", "Status", "Belonging", "Low energy and built-up stress"].map((factor, index) => (
                    <li key={factor} className={`border-t-2 px-0 py-3 ${index % 3 === 0 ? "border-brand-primary/55" : index % 3 === 1 ? "border-brand-secondary" : "border-brand-teal/70"}`}>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
              <a href="#understanding-your-result" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-[0_10px_30px_rgba(4,42,43,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(4,42,43,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2">
                What this changes
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </a>
            </>
          ) : (
            <>
              <h1 className="page-title max-w-[12ch]">
                Your answers stayed with deliberate choice.
              </h1>
              <div className="mt-8 max-w-3xl space-y-5 font-sans text-base leading-8 text-brand-dark/82 md:text-lg md:leading-9">
                <p>
                  Across these situations, your answers did not give us clear evidence
                  that an automatic response overrode what you consciously intended.
                </p>
                <p>
                  That is a good result. It does not prove the Inner Caveman never
                  appears elsewhere; it means this Scan did not find a useful reason
                  to tell you that it did.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/" className={`${resultButton} bg-brand-dark text-white`}>
                  Finish <Check className="h-4 w-4" aria-hidden="true" />
                </Link>
                <a href="#neurocient-approach" className="inline-flex min-h-12 items-center gap-2 font-sans text-sm font-semibold underline underline-offset-4">
                  Explore Neurocient <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </>
          )}
        </div>
      </section>

      {cavemanAppeared && (
        <section id="understanding-your-result" className="scroll-mt-24 bg-white px-5 py-14 sm:px-7 sm:py-18 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <SectionLabel>What the Scan found</SectionLabel>
            <h2 className="max-w-4xl text-[1.85rem] font-bold leading-[1.16] tracking-[-0.02em] sm:text-[2.2rem] lg:text-[2.55rem]">
              Knowing what matters did not always determine the response.
            </h2>
            <div className="mt-8 grid gap-8 sm:grid-cols-2 sm:gap-0">
              <div className="border-t-2 border-brand-teal pt-5 sm:pr-8">
                <h3 className="text-xl font-bold">Your rational mind was present.</h3>
                <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/78">
                  You could understand the situation, know the sensible response, and
                  recognise what would serve you in the longer term.
                </p>
              </div>
              <div className="border-t-2 border-brand-secondary pt-5 sm:border-l sm:pl-8">
                <h3 className="text-xl font-bold">It was not always acting alone.</h3>
                <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/78">
                  An older automatic system could give greater weight to what was
                  immediate, certain, socially significant, or less demanding.
                </p>
              </div>
            </div>
            <p className="mt-8 max-w-3xl font-sans text-base leading-8 text-brand-dark/80">
              This is why advice can be correct and still be incomplete. Advice usually
              tells the rational mind what to do. It does not always change the automatic
              response that is influencing behaviour at the same time.
            </p>
            <p className="mt-8 max-w-3xl border-l-4 border-brand-secondary py-1 pl-5 text-2xl font-bold leading-9 md:text-3xl md:leading-10">
              Neurocient begins with both systems in view.
            </p>
          </div>
        </section>
      )}

      <ResultApproach onContinue={onUnlock} signedIn={signedIn} ready={ready} />
    </main>
  );
}
