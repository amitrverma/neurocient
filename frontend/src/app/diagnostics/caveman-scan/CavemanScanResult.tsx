"use client";

import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { questionsBank } from "./questionsBank";
import { buildScanPortrait, type ScanPortraitPattern } from "./scanPortrait";
import type { CavemanScanResponse } from "./scanStorage";

interface Props {
  responses: CavemanScanResponse[];
  onUnlock: () => void;
  onRestart?: () => void;
}

const CavemanScanResult = ({ responses, onUnlock, onRestart }: Props) => {
  // Responses saved before the evidence model was introduced are hydrated from
  // the current option label so an already-completed scan can still be read.
  const evidence = responses.flatMap((response, index) => {
    const hydrated =
      response.evidence ??
      questionsBank[index]?.options.find((option) => option.label === response.label)?.evidence;
    return hydrated ? [hydrated] : [];
  });
  const portrait = buildScanPortrait(evidence);

  return (
    <main className="min-h-screen bg-[#f8f6f0] font-serif text-brand-dark">
      <section className="px-6 pb-14 pt-10 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-4xl">
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-primary">
            How your Inner Caveman showed up
          </p>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.45rem,7vw,5.4rem)] font-bold leading-[0.98] tracking-[-0.035em]">
            {portrait.headline}
          </h1>
          <p className="mt-7 max-w-2xl font-sans text-base leading-8 text-brand-dark/70 md:text-lg md:leading-9">
            {portrait.introduction}
          </p>
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-14 text-white md:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            You recognised yourself here
          </p>
          <div className="mt-7 divide-y divide-white/16 border-y border-white/16">
            {portrait.primary.evidence.map((item) => (
              <blockquote
                key={item.optionId}
                className="py-6 text-xl font-bold leading-[1.4] tracking-[-0.012em] text-white/95 md:py-8 md:text-2xl"
              >
                “{item.mirror}”
              </blockquote>
            ))}
          </div>
          <p className="mt-7 max-w-2xl font-sans text-sm leading-7 text-white/68 md:text-base md:leading-8">
            These are different situations. But your Inner Caveman made a
            similar protective move underneath them.
          </p>
        </div>
      </section>

      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto max-w-4xl">
          <PatternExplanation pattern={portrait.primary} />
        </div>
      </section>

      <section className="border-y border-brand-dark/10 bg-white px-6 py-14 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
            <Eye className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-6 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-primary">
            Your moment to notice
          </p>
          <p className="mt-4 max-w-3xl text-2xl font-bold leading-[1.35] tracking-[-0.015em] md:text-3xl">
            {portrait.primary.cue}
          </p>
          <p className="mt-6 max-w-2xl font-sans text-base leading-8 text-brand-dark/68">
            Do not fix it yet. For now, see whether you can catch this movement
            a little earlier when it appears in real life.
          </p>
        </div>
      </section>

      <LockedPortrait onUnlock={onUnlock} />
      {onRestart && (
        <div className="bg-brand-dark px-6 pb-12">
          <div className="mx-auto max-w-4xl border-t border-white/16 pt-6">
            <button
              type="button"
              onClick={onRestart}
              className="font-sans text-sm text-white/60 underline decoration-white/30 underline-offset-4 transition hover:text-white"
            >
              Retake the scan
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

const PatternExplanation = ({ pattern }: { pattern: ScanPortraitPattern }) => (
  <div>
    <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-primary">
      {pattern.eyebrow}
    </p>
    <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-[-0.025em] md:text-5xl">
      {pattern.headline}
    </h2>
    <div className="mt-7 grid gap-7 md:grid-cols-2 md:gap-12">
      <div>
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
          What connects the moments
        </p>
        <p className="mt-3 font-sans text-base leading-8 text-brand-dark/72">
          {pattern.explanation}
        </p>
      </div>
      <div>
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
          The Inner Caveman angle
        </p>
        <p className="mt-3 font-sans text-base leading-8 text-brand-dark/72">
          {pattern.protection}
        </p>
      </div>
    </div>
  </div>
);

export const CavemanScanDetailedResult = ({
  responses,
  spots = [],
  onRetake,
}: {
  responses: CavemanScanResponse[];
  spots?: Array<{ id: string; date: string; description: string; pattern?: string | null }>;
  onRetake: () => void;
}) => {
  const evidence = responses.flatMap((response, index) => {
    const hydrated =
      response.evidence ??
      questionsBank[index]?.options.find((option) => option.label === response.label)?.evidence;
    return hydrated ? [hydrated] : [];
  });
  const portrait = buildScanPortrait(evidence);
  const matchingSpots = spots.filter(
    (spot) => spot.pattern === portrait.primary.move,
  );
  const nextStep =
    matchingSpots.length >= 2
      ? {
          title: "Try one small experiment with the Caveman move you have caught.",
          body: "You have seen this movement in more than one real moment. Now you can test one small interruption—not to fix yourself, but to discover what else is possible.",
          href: `/tools/microchallenges?from=spot&move=${portrait.primary.move}`,
          cta: "Choose one small experiment",
        }
      : {
          title:
            matchingSpots.length === 1
              ? "Catch this movement one more time."
              : "Catch this movement once in real life.",
          body:
            matchingSpots.length === 1
              ? "One real moment has joined what you know about your Caveman. Catching it again will tell you more than rushing straight into another solution."
              : "Do not try to change it yet. Notice the moment it begins, what you find yourself doing next, and what the move offers right then.",
          href: "/my-caveman/spot",
          cta: matchingSpots.length === 1 ? "Spot it again" : "Spot my Caveman",
        };

  return (
    <main className="min-h-screen bg-[#f8f6f0] font-serif text-brand-dark">
      <section className="px-6 pb-14 pt-10 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-4xl">
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-primary">
            Your deeper portrait
          </p>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.5rem,7vw,5.4rem)] font-bold leading-[0.98] tracking-[-0.035em]">
            A fuller picture of your Inner Caveman.
          </h1>
          <p className="mt-7 max-w-2xl font-sans text-base leading-8 text-brand-dark/70 md:text-lg md:leading-9">
            This brings together the protective moves that repeated across
            your scan. It is not a diagnosis or a fixed type. It is a closer
            look at what your Inner Caveman may be doing in these moments.
          </p>
        </div>
      </section>

      <section className="border-y border-brand-dark/10 bg-white px-6 py-14 md:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-teal">
            Your primary movement
          </p>
          <PatternExplanation pattern={portrait.primary} />
          <div className="mt-9 divide-y divide-brand-dark/10 border-y border-brand-dark/10">
            {portrait.primary.evidence.map((item) => (
              <p key={item.optionId} className="py-5 font-sans text-sm leading-7 text-brand-dark/72 md:text-base">
                {item.mirror}
              </p>
            ))}
          </div>
        </div>
      </section>

      <DeepPortrait portrait={portrait} />

      {matchingSpots.length > 0 && (
        <section className="border-y border-brand-dark/10 bg-white px-6 py-14 md:py-20">
          <div className="mx-auto max-w-4xl">
            <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-primary">
              Evidence from real life
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.12] tracking-[-0.025em] md:text-4xl">
              You have caught this movement {matchingSpots.length === 1 ? "once" : `${matchingSpots.length} times`} outside the scan.
            </h2>
            <div className="mt-8 divide-y divide-brand-dark/10 border-y border-brand-dark/10">
              {matchingSpots.slice(0, 2).map((spot) => (
                <article key={spot.id} className="grid gap-3 py-5 md:grid-cols-[8rem_1fr]">
                  <time className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
                    {new Date(spot.date).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <p className="whitespace-pre-line font-sans text-sm leading-7 text-brand-dark/72">
                    {spot.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-brand-primary px-6 py-14 text-white md:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            Your next step
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-[-0.025em] md:text-5xl">
            {nextStep.title}
          </h2>
          <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-white/75">
            {nextStep.body}
          </p>
          <Link
            href={nextStep.href}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-secondary px-6 py-3 font-sans text-sm font-semibold text-brand-dark transition hover:bg-white"
          >
            {nextStep.cta}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-6 font-sans text-sm text-white/62">
            Want to understand it first?{" "}
            <Link
              href={portrait.continuation.href}
              className="font-semibold text-white underline decoration-white/35 underline-offset-4"
            >
              {portrait.continuation.cta}
            </Link>
          </p>
          <div className="mt-10 border-t border-white/18 pt-6">
            <button
              type="button"
              onClick={onRetake}
              className="font-sans text-sm text-white/65 underline decoration-white/30 underline-offset-4 transition hover:text-white"
            >
              Retake the scan
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

const LockedPortrait = ({ onUnlock }: { onUnlock: () => void }) => (
  <section className="bg-brand-dark px-6 py-14 text-white md:py-20">
    <div className="mx-auto max-w-4xl">
      <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-secondary">
        Your deeper portrait
      </p>
      <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-[-0.025em] md:text-5xl">
        There is more to how your Inner Caveman moves through your life.
      </h2>
      <p className="mt-6 max-w-2xl font-sans text-base leading-8 text-white/72">
        You already have your primary result. Create an account or sign in to
        open the rest of your portrait and return to it later.
      </p>
      <div className="mt-8 grid gap-3 font-sans text-sm leading-7 text-white/78 sm:grid-cols-2">
        <p className="border-l-2 border-brand-secondary pl-4">Any secondary movement supported by your answers</p>
        <p className="border-l-2 border-brand-secondary pl-4">Where its protection may be costing you</p>
        <p className="border-l-2 border-brand-secondary pl-4">Moments where you already show flexibility</p>
        <p className="border-l-2 border-brand-secondary pl-4">How the immediate protection connects to its later cost</p>
      </div>
      <button
        type="button"
        onClick={onUnlock}
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-brand-secondary px-6 py-3 font-sans text-sm font-semibold text-brand-dark transition hover:bg-white"
      >
        Open my deeper portrait
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </section>
);

const costCopy = {
  momentum: "Momentum — meaningful beginnings are repeatedly moved into a later moment.",
  energy: "Energy — overriding or bargaining with strain can leave less for what matters.",
  rest: "Rest — the body stops while attention remains occupied or alert.",
  connection: "Connection — short-term protection can quietly create distance over time.",
  self_trust: "Self-trust — one difficult moment starts becoming evidence about who you are.",
} as const;

export const DeepPortrait = ({ portrait }: { portrait: ReturnType<typeof buildScanPortrait> }) => {
  const costs = [...new Set(
    [portrait.primary, portrait.secondary]
      .filter((pattern): pattern is ScanPortraitPattern => Boolean(pattern))
      .flatMap((pattern) => pattern.evidence.flatMap((item) => (item.cost ? [item.cost] : []))),
  )].slice(0, 3);

  return (
    <section className="bg-brand-dark px-6 py-14 text-white md:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-secondary">
          Your deeper portrait
        </p>

        {portrait.secondary ? (
          <div className="mt-5">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-white/52">
              Another movement worth noticing
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.12] tracking-[-0.025em] md:text-4xl">
              {portrait.secondary.headline}
            </h2>
            <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-white/72">
              {portrait.secondary.explanation}
            </p>
            <p className="mt-5 max-w-2xl border-l-2 border-brand-secondary pl-5 font-sans text-sm leading-7 text-white/76">
              {portrait.secondary.protection}
            </p>
            <div className="mt-7 space-y-3 border-l-2 border-brand-secondary pl-5">
              {portrait.secondary.evidence.slice(0, 2).map((item) => (
                <p key={item.optionId} className="font-sans text-sm leading-7 text-white/76">
                  {item.mirror}
                </p>
              ))}
            </div>
          </div>
        ) : (
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.12] tracking-[-0.025em] md:text-4xl">
            One Caveman move came through clearly; there was not enough evidence to name a second.
          </h2>
        )}

        {costs.length > 0 && (
          <div className="mt-12 border-t border-white/16 pt-10">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-white/52">
              Where the protection may become costly
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {costs.map((cost) => (
                <p key={cost} className="border-l-2 border-brand-secondary pl-4 font-sans text-sm leading-7 text-white/76">
                  {costCopy[cost]}
                </p>
              ))}
            </div>
          </div>
        )}

        {portrait.contexts.length > 0 && (
          <div className="mt-12 border-t border-white/16 pt-10">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-white/52">
              Where this Caveman move appeared
            </p>
            <p className="mt-4 max-w-3xl text-2xl font-bold leading-[1.4] tracking-[-0.012em]">
              {portrait.contexts.slice(0, 6).join(" · ")}
            </p>
            <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-white/65">
              This does not mean the response governs every part of these areas.
              These are the contexts in which your selected responses gave us evidence.
            </p>
          </div>
        )}

        {portrait.supportedWatchtowers.length > 0 && (
          <div className="mt-12 border-t border-white/16 pt-10">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-white/52">
              What your Caveman may be watching
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {portrait.supportedWatchtowers.map((item) => (
                <div key={item.watchtower} className="border-l-2 border-brand-secondary pl-4">
                  <h3 className="text-xl font-bold text-white">{item.label}</h3>
                  <p className="mt-2 font-sans text-sm leading-7 text-white/72">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 max-w-2xl font-sans text-xs leading-6 text-white/52">
              We show a protective concern only when it appeared more than once.
              A concern not shown here was not ruled out; this scan may simply not have gathered enough evidence for it.
            </p>
          </div>
        )}

        {portrait.flexibleMoments.length > 0 && portrait.primary.move !== "flexible_response" && (
          <div className="mt-12 border-t border-white/16 pt-10">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-white/52">
              Where you already showed room to move
            </p>
            <p className="mt-4 max-w-2xl font-sans text-base leading-8 text-white/72">
              In some moments, the first protective signal did not have to become
              the next action. That does not cancel what you saw elsewhere. It
              shows your response is not fixed.
            </p>
            <div className="mt-5 space-y-3 border-l-2 border-brand-secondary pl-5">
              {portrait.flexibleMoments.map((item) => (
                <p key={item.optionId} className="font-sans text-sm leading-7 text-white/76">
                  {item.mirror}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CavemanScanResult;
