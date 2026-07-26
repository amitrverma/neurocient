"use client";

import type { ReactNode } from "react";
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
    name: "Safety & Survival",
    question: "Am I safe enough?",
    meaning: "Uncertainty, overload, unfinished work, and possible mistakes can all make the safer or clearer move feel urgent.",
  },
  campfire: {
    name: "Affiliation & Belonging",
    question: "Am I still included?",
    meaning: "Silence, distance, and ambiguous social cues can wake the need to check whether your place with others is secure.",
  },
  high_ground: {
    name: "Status & Hierarchy",
    question: "Where do I stand?",
    meaning: "Other people’s progress, judgment, or visibility can become information about your own position and worth.",
  },
  home_path: {
    name: "Mate & Bond Security",
    question: "Is this bond safe?",
    meaning: "Tension inside an important relationship can make avoidance feel safer than risking conflict, rejection, or loss.",
  },
  care_circle: {
    name: "Kin Care",
    question: "Are my people okay?",
    meaning: "Responsibility for people you care about can keep attention alert to their needs, strain, and possible danger.",
  },
};

const wayForwardCopy: Record<ProtectiveMove, { story: string; reframe: string; environment: string; action: string }> = {
  seek_relief: { story: "I am lazy. I always choose the easy thing.", reframe: "When discomfort rises, my system reaches for relief that is close and certain. That is a protective move, not my character.", environment: "Put distance between you and the fastest relief before the difficult moment arrives. Keep the useful first move visible and ready.", action: "Make contact with the meaningful task for two minutes before opening the usual escape." },
  restore_control: { story: "I overthink everything. I can never just begin.", reframe: "Uncertainty makes control feel useful. Planning, checking, or perfecting is often an attempt to make the next moment safer.", environment: "Reduce the number of decisions waiting at the start. Leave one imperfect next move already chosen.", action: "Do one part of the real work before improving the plan, list, format, or system around it." },
  social_monitoring: { story: "I am too sensitive to what other people think.", reframe: "My system watches the social field because position, belonging, and response have always mattered to human beings.", environment: "Reduce endless social evidence when you are already vulnerable. Create spaces where another person's signal is not constantly refreshed.", action: "Name the fact you actually know before following the meaning your mind added to it." },
  create_distance: { story: "I avoid people and difficult conversations.", reframe: "Distance protects me from conflict, judgment, or rejection now. It makes sense even when it costs connection later.", environment: "Choose a lower-pressure time and a smaller opening so contact does not require a perfect conversation.", action: "Say or send one honest sentence without solving the whole relationship in the same moment." },
  override_signal: { story: "I should be able to push through this.", reframe: "My body is sending information. Forcing past it may preserve performance now while making the signal louder later.", environment: "Lower unnecessary demands and create a legitimate pause before the system reaches overload.", action: "Name the signal and reduce the next demand by one believable degree." },
  discharge_pressure: { story: "I am an angry person. I overreact to nothing.", reframe: "The final moment is carrying pressure accumulated elsewhere. The reaction needs accountability and a fuller explanation.", environment: "Build a transition between high-demand time and the people who meet you afterwards.", action: "Pause the exchange and name the overload before answering the person in front of you." },
  self_verdict: { story: "This keeps happening because something is wrong with me.", reframe: "A difficult moment is becoming a verdict because certainty—even painful certainty—can feel safer than ambiguity.", environment: "Remove scoreboards and reminders that turn one event into a total record of who you are.", action: "Describe what happened without using an identity word, then choose one next event rather than a total restart." },
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

const momentNames: Record<number, string> = {
  1: "The report and the inbox",
  2: "The house post after dinner",
  3: "The reel that became forty minutes",
  5: "The message to an old friend",
  8: "The shoes waiting by the door",
  9: "The missing fourth check",
  10: "The words held back at dinner",
  11: "The ordinary question after a full day",
  12: "The book and the unfinished list",
  13: "The half-second pause replayed at night",
  14: "The morning eight hours did not fix",
  15: "The plan still on the wall at 11:47",
};

const helpSeekingChallenge: Record<number, string> = {
  1: "I keep procrastinating on important work.",
  2: "I always feel behind in life.",
  3: "I cannot stop scrolling.",
  5: "I find it hard to reconnect with people.",
  8: "I cannot motivate myself to exercise.",
  9: "I cannot stick to a routine.",
  10: "We cannot talk about what is really wrong.",
  11: "I snap at the people closest to me.",
  12: "I cannot switch off and relax.",
  13: "I replay conversations in my head.",
  14: "I feel tired even after resting.",
  15: "I waste the day, then plan a perfect tomorrow.",
};

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
  const supportedDrives = [...new Set(
    evidence.flatMap((item) => (item.watchtower ? [item.watchtower] : [])),
  )].map((watchtower) => ({
    watchtower,
    ...driveCopy[watchtower],
    moments: evidence.filter((item) => item.watchtower === watchtower).slice(0, 2),
  }));
  const selectedMoments = portrait.primary.evidence.map((item) => {
    const scenarioId = Number(item.optionId.split("-")[0]);
    const question = questionsBank.find(({ id }) => id === scenarioId);
    const option = question?.options.find(
      ({ evidence: optionEvidence }) => optionEvidence?.optionId === item.optionId,
    );
    return {
      ...item,
      title: momentNames[scenarioId] ?? "An ordinary moment",
      challenge: helpSeekingChallenge[scenarioId] ?? "Something here keeps repeating.",
      response: option?.label ?? item.mirror,
    };
  });
  const familiarHeadline = challengeHeadlineFrom(portrait.primary.evidence);

  return (
    <main className="min-h-screen bg-[#f8f6f0] font-serif text-brand-dark">
      <section className="px-6 pb-14 pt-10 md:pb-20 md:pt-16">
        <div className="mx-auto max-w-5xl">
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-primary">
            Your Inner Caveman Scan
          </p>
          <h1 className="mt-5 max-w-4xl text-[clamp(2.5rem,7vw,5.6rem)] font-bold leading-[0.98] tracking-[-0.035em]">
            {familiarHeadline}
          </h1>
          <p className="mt-7 max-w-3xl font-sans text-base leading-8 text-brand-dark/72 md:text-lg md:leading-9">
            {portrait.primary.explanation}
          </p>
          <div className="mt-10 grid overflow-hidden rounded-2xl border border-brand-dark/10 bg-white sm:grid-cols-2">
            <div className="p-5 sm:p-7">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-brand-dark/45">The familiar reading</p>
              <p className="mt-3 font-sans text-base leading-8 text-brand-dark/72">{portrait.primary.usualAdvice}</p>
            </div>
            <div className="border-t border-brand-dark/10 p-5 sm:border-l sm:border-t-0 sm:p-7">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-brand-teal">What your answers add</p>
              <p className="mt-3 font-sans text-base leading-8 text-brand-dark/72">{portrait.primary.whatItMisses}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-14 text-white md:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            The problems you recognise
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-[-0.025em] md:text-5xl">
            They look separate in everyday life.
          </h2>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {selectedMoments.map((item, index) => (
              <article
                key={item.optionId}
                className="rounded-2xl border border-white/14 bg-white/[0.045] p-5 sm:p-6"
              >
                <p className="font-sans text-xs font-bold tracking-[0.14em] text-brand-secondary">0{index + 1}</p>
                <h3 className="mt-4 text-xl font-bold leading-7 text-white">{item.challenge}</h3>
                <p className="mt-3 font-sans text-xs leading-6 text-white/45">{item.title}</p>
                <p className="mt-4 font-sans text-sm leading-7 text-white/72">{item.response}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 max-w-3xl border-l-2 border-brand-secondary pl-5 font-serif text-xl font-bold italic leading-8 text-white/90 md:text-2xl">
            {portrait.primary.protection}
          </p>
        </div>
      </section>

      <section className="border-b border-brand-dark/10 bg-white px-6 py-14 md:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-primary">
            The mismatch underneath
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-[-0.025em] md:text-5xl">
            Different problems. A familiar ancient bargain.
          </h2>
          <p className="mt-6 max-w-3xl font-sans text-base leading-8 text-brand-dark/68">
            {portrait.primary.whatItMisses}
          </p>
          <div className="mt-9 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {supportedDrives.length > 0 ? supportedDrives.map((drive) => (
              <article key={drive.name} className="flex min-h-52 flex-col rounded-2xl border border-brand-dark/10 bg-[#f8f6f0] p-5 sm:p-6">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-brand-teal">{drive.name}</p>
                <h3 className="mt-4 text-2xl font-bold italic leading-8 text-brand-dark">{drive.question}</h3>
                <p className="mt-auto pt-6 font-sans text-sm leading-7 text-brand-dark/65">{drive.meaning}</p>
                {drive.moments[0] ? (
                  <p className="mt-5 border-t border-brand-dark/10 pt-4 font-sans text-xs leading-6 text-brand-dark/55">
                    From your answer: {drive.moments[0].mirror}
                  </p>
                ) : null}
              </article>
            )) : (
              <p className="max-w-3xl font-sans text-base leading-8 text-brand-dark/68 md:col-span-2 lg:col-span-3">
                In these moments, you repeatedly left room between the first
                signal and what happened next. That does not mean the underlying
                drives were absent—only that the Scan did not see enough evidence
                to name one here.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto max-w-4xl">
          <MechanismExplanation pattern={portrait.primary} />
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
    <div className="mt-8 border-y border-brand-dark/12">
      <ResultLayer number="01" title="What connects your moments">
        {pattern.explanation}
      </ResultLayer>
      <ResultLayer number="02" title="The usual intervention">
        <p>{pattern.usualAdvice}</p>
        <p className="mt-4 text-brand-dark/58">
          <strong className="text-brand-dark/78">Why it can help:</strong>{" "}
          {pattern.whyItHelps}
        </p>
      </ResultLayer>
      <ResultLayer number="03" title="What that intervention misses">
        {pattern.whatItMisses}
      </ResultLayer>
      <ResultLayer number="04" title="The Inner Caveman explanation">
        {pattern.protection}
      </ResultLayer>
    </div>

    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <div className="border-l-2 border-brand-teal bg-brand-teal/[0.055] px-5 py-5">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
          What it gives you now
        </p>
        <p className="mt-3 font-sans text-base leading-8 text-brand-dark/72">
          {pattern.immediatePayoff}
        </p>
      </div>
      <div className="border-l-2 border-brand-primary bg-brand-primary/[0.045] px-5 py-5">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
          What it may cost later
        </p>
        <p className="mt-3 font-sans text-base leading-8 text-brand-dark/72">
          {pattern.laterCost}
        </p>
      </div>
    </div>
  </div>
);

const MechanismExplanation = ({ pattern }: { pattern: ScanPortraitPattern }) => (
  <div>
    <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-primary">A different reading</p>
    <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-[-0.025em] md:text-5xl">The advice is not necessarily wrong. The lens is incomplete.</h2>
    <div className="mt-9 grid gap-4 md:grid-cols-2">
      <article className="rounded-2xl border border-brand-dark/10 bg-white p-5 sm:p-6">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-brand-dark/45">Solve the visible problem</p>
        <p className="mt-4 font-sans text-base leading-8 text-brand-dark/72">{pattern.usualAdvice}</p>
        <p className="mt-4 font-sans text-sm leading-7 text-brand-dark/55"><strong className="text-brand-dark/75">Why it can help:</strong> {pattern.whyItHelps}</p>
      </article>
      <article className="rounded-2xl border border-brand-teal/25 bg-brand-teal/[0.045] p-5 sm:p-6">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-brand-teal">Understand the mismatch</p>
        <p className="mt-4 font-sans text-base leading-8 text-brand-dark/72">{pattern.whatItMisses}</p>
      </article>
    </div>
    <p className="mt-8 max-w-3xl border-l-2 border-brand-secondary pl-5 font-serif text-2xl font-bold leading-9 text-brand-dark md:text-3xl md:leading-10">{pattern.protection}</p>
  </div>
);

const ResultLayer = ({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: ReactNode;
}) => (
  <div className="grid gap-3 border-b border-brand-dark/12 py-6 last:border-b-0 md:grid-cols-[3rem_13rem_1fr] md:gap-6 md:py-7">
    <span className="font-sans text-xs font-bold tracking-[0.14em] text-brand-primary">
      {number}
    </span>
    <h3 className="font-sans text-sm font-semibold leading-6 text-brand-dark">
      {title}
    </h3>
    <div className="font-sans text-base leading-8 text-brand-dark/72">
      {children}
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
  const forward = buildPersonalizedForward(portrait.primary);
  const challengeHeadline = challengeHeadlineFrom(portrait.primary.evidence);
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
        Understanding your Caveman is only the beginning.
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

const WayForward = ({ pattern }: { pattern: ScanPortraitPattern }) => {
  const forward = buildPersonalizedForward(pattern);
  return (
    <section className="border-y border-brand-dark/10 bg-white px-6 py-14 md:py-20">
      <div className="mx-auto max-w-5xl">
        <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand-primary">Your way forward</p>
        <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-[-0.025em] md:text-5xl">Change begins before the action.</h2>
        <p className="mt-6 max-w-3xl font-sans text-base leading-8 text-brand-dark/68">Advice usually begins at the fourth step: what should you do? We begin earlier. First separate the moment from who you think you are. Then understand what the response was protecting. Change the conditions around it. Only then ask for a different action—and make the insight easier to retrieve next time.</p>
        {forward.anchor ? (
          <div className="mt-8 max-w-4xl rounded-2xl border border-brand-teal/25 bg-brand-teal/[0.045] p-5 sm:p-6">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-brand-teal">This path starts with what you selected</p>
            <p className="mt-3 font-serif text-xl font-bold leading-8 text-brand-dark sm:text-2xl">“{forward.anchor.mirror}”</p>
            {forward.drive ? (
              <p className="mt-4 font-sans text-sm leading-7 text-brand-dark/65">
                Underneath this moment, <strong className="text-brand-dark">{forward.drive.name}</strong> may be asking: <em>{forward.drive.question}</em>
              </p>
            ) : null}
          </div>
        ) : null}
        <div className="mt-10 grid gap-4">
          <ForwardStep
            number="01"
            label="Do not turn the moment into your identity"
            why="A response that repeats can start sounding like a verdict about who you are. That verdict adds shame without explaining the behaviour."
            text={forward.story}
          />
          <ForwardStep
            number="02"
            label="Understand what the response was protecting"
            why="Before changing the behaviour, make its immediate logic visible. Protection can be costly later and still make sense in the moment."
            text={forward.reframe}
          />
          <ForwardStep
            number="03"
            label="Change what the moment makes easy"
            why="Knowing better is fragile when the old response remains closer, clearer, or more rewarding in the environment."
            text={forward.environment}
          />
          <ForwardStep
            number="04"
            label="Choose one move that fits the real cause"
            why="The action should answer the protection you found—not demand a bigger performance of willpower."
            text={forward.action}
          />
          <ForwardStep
            number="05"
            label="Bring the insight back when it is useful"
            why="Understanding fades. The aim is to retrieve your own insight while the old response is beginning, not hours after it has taken over."
            text={pattern.cue}
          />
        </div>
      </div>
    </section>
  );
};

const ForwardStep = ({ number, label, why, text }: { number: string; label: string; why: string; text: string }) => (
  <article className="grid gap-4 rounded-2xl border border-brand-dark/10 bg-white p-5 md:grid-cols-[3rem_14rem_1fr] md:gap-6 md:p-7">
    <p className="font-sans text-xs font-bold tracking-[0.14em] text-brand-primary">{number}</p>
    <div>
      <h3 className="font-sans text-sm font-semibold leading-6 text-brand-dark">{label}</h3>
      <p className="mt-2 font-sans text-xs leading-6 text-brand-dark/52">{why}</p>
    </div>
    <p className="border-l-2 border-brand-secondary pl-4 font-sans text-base leading-8 text-brand-dark/74">{text}</p>
  </article>
);

const costCopy = {
  momentum: "Momentum — meaningful beginnings are repeatedly moved into a later moment.",
  energy: "Energy — overriding or bargaining with strain can leave less for what matters.",
  rest: "Rest — the body stops while attention remains occupied or alert.",
  connection: "Connection — short-term protection can quietly create distance over time.",
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
