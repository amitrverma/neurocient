"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Eye, Layers3, NotebookPen, RotateCcw } from "lucide-react";
import { buildScanReflections, publicScanReflections } from "@/app/diagnostics/caveman-scan/scanReflections";
import type { CavemanScanResponse } from "@/app/diagnostics/caveman-scan/scanStorage";

export default function MyCavemanWorkspace({ responses, onRetake }: {
  responses: CavemanScanResponse[];
  onRetake: () => void;
}) {
  const allReflections = buildScanReflections(responses);
  const startingReflections = publicScanReflections(responses);
  const featured = startingReflections[0];

  return (
    <main className="surface-page min-h-[calc(100svh-4rem)]">
      <section className="border-b border-brand-dark/10 bg-white px-6 py-8 md:py-10">
        <div className="mx-auto max-w-6xl">
          <p className="page-eyebrow text-brand-teal">Your Neurocient</p>
          <h1 className="page-section-title mt-2">My Inner Caveman</h1>
          <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-brand-dark/68 md:text-base">
            Your Scan answers and the situations you notice in real life, kept together without turning them into a score or personality type.
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-14 px-6 py-10 md:gap-16 md:py-14">
        {featured ? (
          <section aria-labelledby="continue-reflection-title">
            <p className="page-eyebrow text-brand-teal">Continue from your Scan</p>
            <div className="mt-7 grid border-y border-brand-dark/12 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="bg-brand-dark px-6 py-8 text-white md:px-8 md:py-10">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-brand-secondary">
                  <Eye className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-6 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">A reflection to return to</p>
                <h2 id="continue-reflection-title" className="mt-4 text-3xl font-bold leading-tight md:text-4xl">{featured.title}</h2>
                <p className="mt-4 max-w-xl font-sans text-sm leading-7 text-white/72">{featured.selectedMirror}</p>
                <p className="mt-7 border-l-2 border-brand-secondary pl-4 text-xl font-bold leading-8">{featured.question}</p>
              </div>

              <div className="border-t border-brand-dark/12 bg-white lg:border-l lg:border-t-0 lg:pl-8">
                <WorkspaceLink href="/tools/spots" icon={<NotebookPen />} label="Spot the Inner Caveman" text="Add a concrete situation you noticed outside the Scan." />
                <WorkspaceLink href="/insights" icon={<BookOpen />} label="Explore Insights" text="Go deeper into a behaviour or situation you recognise." />
                <WorkspaceLink href="/practice" icon={<Layers3 />} label="Continue with Practice" text="Work with one behaviour through IKEA + Reinforcement." />
              </div>
            </div>
          </section>
        ) : (
          <section className="border-y border-brand-dark/12 bg-white py-8" aria-labelledby="deliberate-result-title">
            <p className="page-eyebrow text-brand-teal">Your completed Scan</p>
            <h2 id="deliberate-result-title" className="mt-4 max-w-3xl text-3xl font-bold leading-tight md:text-4xl">Your answers stayed with the more deliberate response.</h2>
            <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-brand-dark/68">The Scan did not surface a useful Inner Caveman example, so My Inner Caveman will not invent one. You can begin with something you notice in real life.</p>
            <Link href="/tools/spots" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white">
              Record a real-life situation <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        )}

        {allReflections.length > 0 && (
          <section aria-labelledby="scan-reflections-title">
            <div className="max-w-3xl">
              <p className="page-eyebrow text-brand-teal">From your Scan</p>
              <h2 id="scan-reflections-title" className="mt-3 text-3xl font-bold leading-[1.08] text-brand-dark md:text-4xl">Return to the situations where it became visible.</h2>
              <p className="mt-4 font-sans text-sm leading-7 text-brand-dark/68">Each item comes from an answer you selected. Open one when it feels relevant; there is no ranking or profile underneath them.</p>
            </div>
            <div className="mt-7 border-y border-brand-dark/12 bg-white">
              {allReflections.map((reflection, index) => (
                <details key={reflection.id} className="group border-b border-brand-dark/12 last:border-b-0">
                  <summary className="grid cursor-pointer list-none grid-cols-[2.5rem_1fr_auto] gap-4 px-1 py-6 marker:content-none md:px-0">
                    <span className="font-sans text-xs font-semibold text-brand-primary">{String(index + 1).padStart(2, "0")}</span>
                    <span>
                      <strong className="block text-xl leading-tight text-brand-dark md:text-2xl">{reflection.title}</strong>
                      <span className="mt-2 block font-sans text-sm leading-7 text-brand-dark/64">{reflection.selectedMirror}</span>
                    </span>
                    <span className="text-xl text-brand-primary transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <div className="grid gap-6 border-t border-brand-dark/8 pb-7 pt-6 md:grid-cols-2 md:pl-[3.5rem]">
                    <div>
                      <p className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-brand-teal">What you chose</p>
                      <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/78">{reflection.selectedAnswer}</p>
                    </div>
                    <div>
                      <p className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-brand-teal">More deliberate response</p>
                      <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/78">{reflection.deliberateAnswer}</p>
                    </div>
                    <p className="border-l-2 border-brand-secondary pl-4 text-lg font-bold leading-7 md:col-span-2">{reflection.question}</p>
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-wrap items-center justify-between gap-5 border-t border-brand-dark/12 pt-7">
          <div>
            <p className="font-sans text-sm font-semibold text-brand-dark">Want a fresh set of situations?</p>
            <p className="mt-1 font-sans text-sm text-brand-dark/58">Retaking replaces the current browser Scan once you begin again.</p>
          </div>
          <button type="button" onClick={onRetake} className="inline-flex min-h-11 items-center gap-2 font-sans text-sm font-semibold text-brand-dark underline decoration-brand-dark/20 underline-offset-4">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Retake the Scan
          </button>
        </section>
      </div>
    </main>
  );
}

const WorkspaceLink = ({ href, icon, label, text }: {
  href: string;
  icon: ReactNode;
  label: string;
  text: string;
}) => (
  <Link href={href} className="group grid grid-cols-[2.5rem_1fr_auto] gap-4 border-b border-brand-dark/12 py-6 last:border-b-0">
    <span className="text-brand-accent [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
    <span>
      <strong className="block font-sans text-sm text-brand-dark transition group-hover:text-brand-primary">{label}</strong>
      <span className="mt-1 block font-sans text-sm leading-6 text-brand-dark/68">{text}</span>
    </span>
    <ArrowRight className="h-4 w-4 text-brand-accent transition group-hover:translate-x-1" aria-hidden="true" />
  </Link>
);
