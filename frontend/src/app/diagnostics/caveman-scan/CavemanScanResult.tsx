"use client";

import Link from "next/link";
import { ArrowRight, Eye } from "lucide-react";
import { questionsBank } from "./questionsBank";
import { buildScanPortrait, type ScanPortraitPattern } from "./scanPortrait";
import type { CavemanScanResponse } from "./scanStorage";
import type { ProtectiveConcern, ScanOptionEvidence, Watchtower } from "./scanEvidence";
import type { ProtectiveMove } from "./scanEvidence";

interface Props {
  responses: CavemanScanResponse[];
  onUnlock: () => void;
  onRestart?: () => void;
}

const driveCopy: Record<Watchtower, { name: string; question: string; meaning: string }> = {
  horizon: {
    name: "Certainty & Control",
    question: "What can I predict or contain?",
    meaning: "Uncertainty, overload, unfinished work, and possible mistakes can all make the clearer or more controllable move feel urgent.",
  },
  campfire: {
    name: "Affiliation & Belonging",
    question: "Where do I stand with them?",
    meaning: "Silence, distance, and ambiguous social cues can increase checking for changes in connection or acceptance.",
  },
  high_ground: {
    name: "Status & Hierarchy",
    question: "How do I compare?",
    meaning: "Other people’s progress, judgment, or visibility can become information about your own position and worth.",
  },
  home_path: {
    name: "Close Bonds",
    question: "What could this conversation change?",
    meaning: "Tension inside an important relationship can make avoidance easier than risking conflict, rejection, or loss.",
  },
  care_circle: {
    name: "Care Responsibility",
    question: "Who needs something from me?",
    meaning: "Responsibility for people you care about can keep thought returning to their needs, strain, and unresolved demands.",
  },
};

const wayForwardCopy: Record<ProtectiveMove, { story: string; reframe: string; environment: string; action: string }> = {
  seek_relief: { story: "I am lazy. I always choose the easy thing.", reframe: "When discomfort rises, relief that is close and certain becomes easier to choose. That is an automatic response, not a character verdict.", environment: "Put distance between you and the fastest relief before the difficult moment arrives. Keep the useful first move visible and ready.", action: "Make contact with the meaningful task for two minutes before opening the usual escape." },
  restore_control: { story: "I overthink everything. I can never just begin.", reframe: "Uncertainty makes control feel useful. Planning, checking, or perfecting can remove uncertainty before the real work has begun.", environment: "Reduce the number of decisions waiting at the start. Leave one imperfect next move already chosen.", action: "Do one part of the real work before improving the plan, list, format, or system around it." },
  social_monitoring: { story: "I am too sensitive to what other people think.", reframe: "Automatic social monitoring gives weight to position, belonging, and other people's responses because those signals have long mattered to human beings.", environment: "Reduce endless social evidence when you are already vulnerable. Create spaces where another person's signal is not constantly refreshed.", action: "Name the fact you actually know before following the meaning your mind added to it." },
  create_distance: { story: "I avoid people and difficult conversations.", reframe: "Distance removes conflict, judgment, or rejection from the present moment. That immediate result can keep avoidance useful even when it costs connection later.", environment: "Choose a lower-pressure time and a smaller opening so contact does not require a perfect conversation.", action: "Say or send one honest sentence without solving the whole relationship in the same moment." },
  override_signal: { story: "I should be able to push through this.", reframe: "My body is sending information. Forcing past it may preserve performance now while making the signal louder later.", environment: "Lower unnecessary demands and create a legitimate pause before the system reaches overload.", action: "Name the signal and reduce the next demand by one believable degree." },
  discharge_pressure: { story: "I am an angry person. I overreact to nothing.", reframe: "The final moment is carrying pressure accumulated elsewhere. The reaction needs accountability and a fuller explanation.", environment: "Build a transition between high-demand time and the people who meet you afterwards.", action: "Pause the exchange and name the overload before answering the person in front of you." },
  self_verdict: { story: "This keeps happening because something is wrong with me.", reframe: "A difficult moment is becoming a verdict because certainty—even painful certainty—can feel easier to hold than ambiguity.", environment: "Remove scoreboards and reminders that turn one event into a total record of who you are.", action: "Describe what happened without using an identity word, then choose one next event rather than a total restart." },
  flexible_response: { story: "I should always be able to respond this way.", reframe: "You showed flexibility in these moments. That is evidence of room, not a new standard you must perform perfectly.", environment: "Notice what made the more flexible response possible and make that condition easier to find again.", action: "Record one detail that helped you pause, choose, or stay with the moment." },
};

const concernForwardCopy: Partial<Record<ProtectiveConcern, { environment: string; action: string }>> = {
  uncertainty: {
    environment: "Remove one decision from the beginning. Leave the next visible move chosen, open, and easier to enter than the nearest escape.",
    action: "Make one imperfect piece of contact with the real thing before planning, checking, polishing, or switching away.",
  },
  status: {
    environment: "Reduce the stream of other people's progress when you are already measuring yourself. Keep one piece of evidence from your own life visible instead.",
    action: "Say what the moment tells you about them, then name one thing it does not prove about you.",
  },
  belonging: {
    environment: "Make contact lower stakes: choose a quieter channel, a simpler opening, and a moment that does not require the whole relationship to be resolved.",
    action: "Send or say one honest sentence before waiting to feel completely safe or interesting enough.",
  },
  bond_security: {
    environment: "Choose a time with enough space for honesty, before distance has to compete with tiredness, logistics, or another screen.",
    action: "Name the distance or concern without demanding an immediate solution from either person.",
  },
  energy: {
    environment: "Lower the setup cost before the low-energy moment arrives. Put the smallest version within reach and remove the need to choose a full performance.",
    action: "Respond to the energy you actually have with a smaller beginning, not a promise to become a different person tomorrow.",
  },
  overload: {
    environment: "Create a short transition before one demanding context meets the next. Reduce incoming requests while your system is already full.",
    action: "Name the overload and ask for one minute before the pressure answers through you.",
  },
  social_ambiguity: {
    environment: "Do not keep ambiguous cues continuously available for review. Give the mind a clear point at which no new evidence means the case stays open, not guilty.",
    action: "Separate the detail you observed from the meaning you added, then stop before inventing another explanation.",
  },
};

const strengthRank = { weak: 1, moderate: 2, strong: 3 } as const;

const challengeThemes: Record<number, string[]> = {
  1: ["lost productivity"],
  2: ["low confidence"],
  3: ["poor focus", "lost productivity"],
  5: ["disconnection"],
  8: ["low motivation", "fitness"],
  9: ["low motivation"],
  10: ["relationship strain"],
  11: ["stress"],
  12: ["stress", "difficulty switching off"],
  13: ["overthinking"],
  14: ["low energy", "sleep problems"],
  15: ["lost productivity", "low motivation"],
};

const joinNaturally = (items: string[]) => {
  if (items.length <= 1) return items[0] ?? "a problem to fix";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items.at(-1)}`;
};

const challengeHeadlineFrom = (evidence: ScanOptionEvidence[]) => {
  const themes = [...new Set(
    evidence.flatMap(
      (item) => challengeThemes[Number(item.optionId.split("-")[0])] ?? [],
    ),
  )].slice(0, 3);
  const frame = joinNaturally(themes);
  return `${frame.charAt(0).toUpperCase()}${frame.slice(1)}.`;
};

export const buildPersonalizedForward = (pattern: ScanPortraitPattern) => {
  const base = wayForwardCopy[pattern.move];
  const anchor = [...pattern.evidence].sort(
    (a, b) => strengthRank[b.strength] - strengthRank[a.strength],
  )[0];
  const concernCopy = anchor?.concern ? concernForwardCopy[anchor.concern] : undefined;
  return {
    ...base,
    environment: concernCopy?.environment ?? base.environment,
    action: concernCopy?.action ?? base.action,
    anchor,
    drive: anchor?.watchtower ? driveCopy[anchor.watchtower] : undefined,
  };
};

const CavemanScanResult = ({ onUnlock }: Props) => {
  return (
    <main className="min-h-screen bg-[#f8f6f0] font-serif text-brand-dark">
      <LockedPortrait onUnlock={onUnlock} />
    </main>
  );
};

export const CavemanScanDetailedResult = ({
  responses,
  spots = [],
  spotsUnavailable = false,
  onRetake,
}: {
  responses: CavemanScanResponse[];
  spots?: Array<{ id: string; date: string; description: string; pattern?: string | null }>;
  spotsUnavailable?: boolean;
  onRetake: () => void;
}) => {
  const evidence = responses.flatMap((response, index) => {
    const hydrated =
      response.evidence ??
      questionsBank[index]?.options.find((option) => option.label === response.label)?.evidence;
    return hydrated ? [hydrated] : [];
  });
  const portrait = buildScanPortrait(evidence);
  const forward = buildPersonalizedForward(portrait.primary);
  const challengeHeadline = challengeHeadlineFrom(portrait.primary.evidence);
  const matchingSpots = spots.filter(
    (spot) => spot.pattern === portrait.primary.move,
  );
  const nextStep = spotsUnavailable
    ? {
        title: "Your saved real-life evidence is unavailable right now.",
        body: "Your scan portrait is still here. Return to your Spots when the connection is restored before deciding whether this pattern has repeated.",
        href: "/tools/spots",
        cta: "Open my Spots",
      }
    : matchingSpots.length >= 2
      ? {
          title: "Try one small experiment with the Caveman move you have caught.",
          body: "You have seen this response in more than one real moment. Now you can test one small change to discover what makes another response easier.",
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
              ? "One real moment has joined the evidence from your scan. Recording it again will tell you more than rushing straight into another solution."
              : "Do not try to change it yet. Notice the moment it begins, what you find yourself doing next, and what changes immediately.",
          href: "/my-caveman/spot",
          cta: matchingSpots.length === 1 ? "Spot it again" : "Spot my Caveman",
        };

  return (
    <main className="min-h-screen bg-[#f8f6f0] font-serif text-brand-dark">
      <section className="px-6 pb-14 pt-10 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-4xl">
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-primary">
            Your result is saved
          </p>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.5rem,7vw,5.4rem)] font-bold leading-[0.98] tracking-[-0.035em]">
            {challengeHeadline}
          </h1>
          <p className="mt-7 max-w-2xl font-sans text-base leading-8 text-brand-dark/70 md:text-lg md:leading-9">
            {forward.reframe}
          </p>
        </div>
      </section>

      <section className="border-y border-brand-dark/10 bg-white px-6 py-14 md:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
            <Eye className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="mt-6 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-primary">
            The moment to catch
          </p>
          <h2 className="mt-4 max-w-3xl text-2xl font-bold leading-[1.35] tracking-[-0.015em] md:text-4xl">
            {portrait.primary.cue}
          </h2>
          <p className="mt-6 max-w-2xl font-sans text-base leading-8 text-brand-dark/68">
            Do not change it yet. Notice what was happening, what you felt pulled
            to do, and what that response offered immediately.
          </p>
        </div>
      </section>

      {matchingSpots.length > 0 && (
        <section className="px-6 py-14 md:py-20">
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
        </div>
      </section>

      <section className="border-b border-brand-dark/10 bg-white px-6 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <details className="group border-y border-brand-dark/10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-sans text-sm font-semibold text-brand-dark marker:content-none">
              See the fuller picture
              <span className="text-xl font-normal text-brand-primary transition-transform group-open:rotate-45" aria-hidden="true">+</span>
            </summary>
            <div className="border-t border-brand-dark/10 pb-8 pt-2">
              <DeepPortrait portrait={portrait} embedded />
            </div>
          </details>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 font-sans text-sm">
            <Link
              href={portrait.continuation.href}
              className="font-semibold text-brand-primary underline decoration-brand-primary/30 underline-offset-4"
            >
              {portrait.continuation.cta}
            </Link>
            <button
              type="button"
              onClick={onRetake}
              className="text-brand-dark/55 underline decoration-brand-dark/20 underline-offset-4 transition hover:text-brand-dark"
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
        How Neurocient Labs helps
      </p>
      <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-[-0.025em] md:text-5xl">
        Recognising the automatic response is only the beginning.
      </h2>
      <p className="mt-6 max-w-2xl font-sans text-base leading-8 text-white/72">
        Most advice jumps straight to discipline, routines, or willpower.
        Neurocient starts with why the response made sense—then helps you make
        a different response easier when the same moment returns, and easier to
        remember before the old one takes over.
      </p>
      <div className="mt-8 grid gap-4 font-sans text-sm leading-7 text-white/78 sm:grid-cols-3">
        <p className="border-l-2 border-brand-secondary pl-4">Replace the verdict about you with a more accurate story.</p>
        <p className="border-l-2 border-brand-secondary pl-4">Change the conditions that keep making the old response easy.</p>
        <p className="border-l-2 border-brand-secondary pl-4">Try one small move matched to what is actually driving the moment.</p>
      </div>
      <p className="mt-7 max-w-2xl font-sans text-sm leading-7 text-white/55">
        Sign in to turn this result into a personal way forward you can return to.
      </p>
      <button
        type="button"
        onClick={onUnlock}
        className="mt-9 inline-flex items-center gap-2 rounded-full bg-brand-secondary px-6 py-3 font-sans text-sm font-semibold text-brand-dark transition hover:bg-white"
      >
        Build my way forward
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  </section>
);

const costCopy = {
  momentum: "Momentum — meaningful beginnings are repeatedly moved into a later moment.",
  energy: "Energy — overriding or bargaining with strain can leave less for what matters.",
  rest: "Rest — the body stops while attention remains occupied or alert.",
  connection: "Connection — short-term avoidance can quietly create distance over time.",
  self_trust: "Self-trust — one difficult moment starts becoming evidence about who you are.",
} as const;

export const DeepPortrait = ({
  portrait,
  embedded = false,
}: {
  portrait: ReturnType<typeof buildScanPortrait>;
  embedded?: boolean;
}) => {
  const costs = [...new Set(
    [portrait.primary, portrait.secondary]
      .filter((pattern): pattern is ScanPortraitPattern => Boolean(pattern))
      .flatMap((pattern) => pattern.evidence.flatMap((item) => (item.cost ? [item.cost] : []))),
  )].slice(0, 3);

  return (
    <section className={`${embedded ? "mt-6 rounded-2xl" : ""} bg-brand-dark px-6 py-14 text-white md:py-20`}>
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
              Where the response may become costly
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
              What automatic processing may prioritise
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
              We show a repeated concern only when it appeared more than once.
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
              In some moments, the first automatic signal did not have to become
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
