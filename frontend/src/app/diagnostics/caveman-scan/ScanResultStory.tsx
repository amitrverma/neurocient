"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight, Check, Eye } from "lucide-react";
import { SectionLabel } from "../../components/landing/LandingShared";
import { buildScanReflections, publicScanReflections } from "./scanReflections";
import type { CavemanScanResponse } from "./scanStorage";

export const resultButton = "inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-2.5 font-sans text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60";

export default function ScanResultStory({
  responses,
  onUnlock,
  signedIn = false,
  ready = true,
  mode = "result",
  onRetake,
}: {
  responses: CavemanScanResponse[];
  onUnlock: () => void;
  signedIn?: boolean;
  ready?: boolean;
  mode?: "result" | "saved";
  onRetake?: () => void;
}) {
  const allReflections = buildScanReflections(responses);
  const reflections = publicScanReflections(responses);
  const visibleIds = new Set(reflections.map(({ id }) => id));
  const additionalReflections = mode === "saved"
    ? allReflections.filter(({ id }) => !visibleIds.has(id))
    : [];
  const cavemanAppeared = allReflections.length > 0;

  return (
    <main className="surface-page caveman-scan-page min-h-[calc(100svh-4rem)]">
      <section className="relative overflow-hidden px-5 pb-14 pt-10 sm:px-7 sm:pb-20 sm:pt-14 lg:py-24">
        <div className="pointer-events-none absolute -right-32 -top-40 h-96 w-96 rounded-full bg-brand-secondary/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl">
          <div className="page-eyebrow mb-7 flex flex-wrap items-center gap-2 text-brand-teal">
            <Check className="h-4 w-4" aria-hidden="true" />
            {mode === "saved" ? "Your completed Scan" : "Scan complete"}
            <span className="mx-1 text-brand-dark/30" aria-hidden="true">/</span> My Inner Caveman
          </div>
          <h1 className="page-title max-w-[14ch]">
            {cavemanAppeared
              ? "You brought your Inner Caveman into view."
              : "Your answers stayed with the more deliberate response."}
          </h1>
          <div className="mt-7 max-w-2xl space-y-4 font-sans text-base leading-8 text-brand-dark/75 sm:text-lg sm:leading-9">
            {cavemanAppeared ? (
              <>
                <p>Your result is not a score, a type, or a hidden pattern assigned to you.</p>
                <p>It reflects the situations in which your own answers showed an automatic response arriving alongside what you already knew.</p>
              </>
            ) : (
              <p>In these twelve situations, your answers did not give us a useful example of the Inner Caveman taking the lead. We will not invent one.</p>
            )}
          </div>
          {cavemanAppeared && (
            <a href="#your-reflections" className={`${resultButton} mt-8 bg-brand-dark text-white`}>
              Return to my answers <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </section>

      {cavemanAppeared && (
        <section id="your-reflections" className="scroll-mt-20 border-y border-brand-dark/10 bg-white px-5 py-14 sm:px-7 sm:py-18 lg:py-20">
          <div className="mx-auto max-w-5xl">
            <SectionLabel>A few answers to return to</SectionLabel>
            <h2 className="max-w-4xl text-[1.85rem] font-bold leading-[1.16] tracking-[-0.02em] sm:text-[2.2rem] lg:text-[2.55rem]">
              These are the situations where your Inner Caveman became visible.
            </h2>
            <p className="mt-5 max-w-3xl font-sans text-base leading-8 text-brand-dark/70">
              Each reflection comes directly from an answer you selected. We have not combined them into a diagnosis or used one answer to explain another.
            </p>
            <div className="mt-10 space-y-6">
              {reflections.map((reflection, index) => <ReflectionItem key={reflection.id} reflection={reflection} index={index} />)}
            </div>
            {mode === "result" && allReflections.length > reflections.length && (
              <p className="mt-8 max-w-3xl font-sans text-sm leading-7 text-brand-dark/62">
                This is a stable selection from your completed Scan. Save it to My Inner Caveman to return to the rest of the situations where it appeared.
              </p>
            )}
            {mode === "saved" && additionalReflections.length > 0 && (
              <details className="group mt-9 border-y border-brand-dark/15">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-sans text-sm font-semibold marker:content-none">
                  Explore {additionalReflections.length} more situations from my Scan
                  <span className="text-xl font-normal text-brand-primary transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <div className="space-y-6 border-t border-brand-dark/10 pb-8 pt-2">
                  {additionalReflections.map((reflection, index) => (
                    <ReflectionItem key={reflection.id} reflection={reflection} index={reflections.length + index} />
                  ))}
                </div>
              </details>
            )}
          </div>
        </section>
      )}

      <section className="bg-brand-dark px-5 py-14 text-white sm:px-7 sm:py-18 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionLabel tone="dark">Inner Caveman and deliberate thought</SectionLabel>
          <div className="grid gap-9 md:grid-cols-[1.15fr_0.85fr] md:gap-14">
            <h2 className="text-3xl font-bold leading-[1.12] tracking-[-0.025em] sm:text-4xl lg:text-5xl">
              Knowing the more rational response does not mean it will arrive first.
            </h2>
            <div className="space-y-4 font-sans text-base leading-8 text-white/74">
              <p>Your deliberate thinking can understand what matters, consider the future, and choose between alternatives.</p>
              <p>Automatic processing can still give more weight to what is immediate, certain, socially significant, or less demanding.</p>
              <p>The Scan does not decide which one you are. It lets you see both more clearly in situations you recognised.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-7 sm:py-18 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionLabel>What Neurocient adds</SectionLabel>
          <h2 className="max-w-4xl text-[1.85rem] font-bold leading-[1.16] tracking-[-0.02em] sm:text-[2.2rem] lg:text-[2.55rem]">
            Understanding is not the finish line. Neurocient helps you move from something you understand to something you live.
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden border border-brand-dark/12 bg-brand-dark/12 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Insights", "Understand why a familiar response can make sense without turning it into a verdict about you."],
              ["Tools", "Capture what actually happened while the details are still available."],
              ["Practice", "Work through identity, knowledge, environment and action around a real behaviour."],
              ["Programs", "Go deeper with structured personal or workplace support."],
            ].map(([name, copy]) => (
              <div key={name} className="bg-[var(--surface-paper)] p-5 sm:p-6">
                <h3 className="text-xl font-bold">{name}</h3>
                <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">{copy}</p>
              </div>
            ))}
          </div>
          <p className="mt-7 max-w-3xl border-l-2 border-brand-secondary pl-5 font-sans text-sm leading-7 text-brand-dark/72">
            IKEA + Reinforcement connects the explanation to what you notice, change, practise, and revisit in real life.
          </p>
        </div>
      </section>

      <section className="bg-brand-secondary/18 px-5 py-14 sm:px-7 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
            <Eye className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-6 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
            {mode === "saved" ? "Continue with real life" : "Continue without losing what you saw"}
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.12] tracking-[-0.025em] sm:text-4xl">
            {mode === "saved"
              ? cavemanAppeared
                ? "Add a situation you notice outside the Scan."
                : "Start with a situation you notice in real life."
              : cavemanAppeared
                ? "Save these reflections to My Inner Caveman."
                : "Keep this completed Scan in My Inner Caveman."}
          </h2>
          <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-brand-dark/72">
            {mode === "saved"
              ? "My Inner Caveman grows through situations you actually notice—not through a profile assigned to you."
              : cavemanAppeared
                ? "After login, the same experience continues with the rest of your relevant Scan answers and the situations you record over time."
                : "Save this result without turning it into a problem. You can add an Inner Caveman situation later if one becomes recognisable in real life."}
          </p>
          <button type="button" disabled={!ready} onClick={onUnlock} className={`${resultButton} mt-7 bg-brand-dark text-white`}>
            {!ready
              ? "Checking your account…"
              : mode === "saved"
                ? "Record a real-life situation"
                : signedIn
                  ? "Continue to My Inner Caveman"
                  : "Save to My Inner Caveman"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 font-sans text-sm">
            <Link href="/insights" className="font-semibold underline decoration-brand-primary/30 underline-offset-4">Explore Insights</Link>
            {onRetake ? (
              <button type="button" onClick={onRetake} className="text-brand-dark/58 underline decoration-brand-dark/20 underline-offset-4">Retake the Scan</button>
            ) : (
              <Link href="/" className="text-brand-dark/58 underline decoration-brand-dark/20 underline-offset-4">Return to Neurocient</Link>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

const ReflectionItem = ({ reflection, index }: {
  reflection: ReturnType<typeof buildScanReflections>[number];
  index: number;
}) => (
  <article className="grid border-t border-brand-dark/15 pt-6 md:grid-cols-[10rem_1fr] md:gap-8 md:pt-8">
    <div>
      <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">Reflection {String(index + 1).padStart(2, "0")}</span>
      <p className="mt-2 font-sans text-sm font-semibold text-brand-dark/58">{reflection.title}</p>
    </div>
    <div className="mt-5 md:mt-0">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">What you chose</p>
      <p className="mt-3 text-xl font-bold leading-8">{reflection.selectedAnswer}</p>
      <p className="mt-4 font-sans text-sm leading-7 text-brand-dark/72">{reflection.selectedMirror}</p>
      {reflection.deliberateAnswer && (
        <details className="mt-6 border-y border-brand-dark/12 py-4 font-sans">
          <summary className="cursor-pointer text-sm font-semibold">Contrast this with the more deliberate response</summary>
          <div className="mt-4 space-y-3 text-sm leading-7 text-brand-dark/70">
            <p>{reflection.deliberateAnswer}</p>
            {reflection.deliberateMirror && <p>{reflection.deliberateMirror}</p>}
          </div>
        </details>
      )}
      <div className="mt-6 bg-brand-secondary/18 px-5 py-5">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">A question to keep</p>
        <p className="mt-3 text-lg font-bold leading-7">{reflection.question}</p>
      </div>
    </div>
  </article>
);
