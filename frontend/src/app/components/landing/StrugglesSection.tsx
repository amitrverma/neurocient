"use client";

import { useState } from "react";
import { SectionDecorations, SectionLabel } from "./LandingShared";

const struggles = [
  {
    title: "Escaping Into the Scroll",
    eyebrow: "One more check",
    lead: "The work is right there.",
    detail:
      "You tell yourself you'll start in a minute: just one check, one tab, one video. Something small, something harmless. And then another. Time passes without resistance. It doesn't feel like a choice. It feels like something you slipped into. When you look up, the task is still there.",
    close:
      "Only now, it feels heavier than before.",
  },
  {
    title: "Pressure That Never Switches Off",
    eyebrow: "Always in the background",
    lead: "There's always something in the background.",
    detail:
      "Something unfinished. Something pending. Something you should get to next. Even in the quieter moments, it doesn't fully leave. It stays: subtle, but present. You move from one thing to another, carrying it along.",
    close:
      "Not urgent enough to act on. Not distant enough to ignore.",
  },
  {
    title: "Worries That Never Leave",
    eyebrow: "The mind keeps rehearsing",
    lead: "You replay conversations and anticipate problems before they happen.",
    detail:
      "You are thinking/overthinking all the time. Pre-playing and re-playing social interactions in your head. And more often than not the things you imagine might go wrong never happen.",
    close:
      "No inner dialogue, just peace. You can’t even imagine what that’s like.",
  },
  {
    title: "The Guilt That Doesn't Go Away",
    eyebrow: "Another plan abandoned",
    lead: "You've hit a point where you're scared for yourself.",
    detail:
      "You've tried every self-help method under the sun — gym, healthy food, multivitamins, motivational quotes all over your room, goal planning, screen filters — but nothing sticks. You make detailed plans,",
    close:
      "print them, write them on your walls, and yet you waste whole days doing nothing meaningful. You keep procrastinating.  Just watching random videos or scrolling aimlessly.",
  },
  {
    title: "Measuring Yourself Against Others",
    eyebrow: "Status scanning",
    lead: "You're doing your thing, and then something shifts.",
    detail:
      "Someone else is ahead. Moving faster. Doing it better. At least, it looks that way. You weren't thinking about it a moment ago. Now you are. Your pace feels slower. Your progress feels smaller. What you have doesn't land the same anymore. Nothing has changed.",
    close:
      "But it feels like you've fallen behind.",
  },
  {
    title: "Rest That Doesn't Restore",
    eyebrow: "Recovery that doesn't land",
    lead: "You sleep. You take breaks. You step away when you can.",
    detail:
      "But it doesn't quite land. The day starts a little lower than it should. Simple things take more effort. By the time you get to what matters, there isn't much left.",
    close:
      "It's not that you're doing nothing. It just never feels like you've recovered.",
  },
  {
    title: "Waiting to Feel Ready",
    eyebrow: "The moving start line",
    lead: "You know what needs to be done.",
    detail:
      "It isn't unclear. You've thought about it enough times already. But you wait. For the right mood. The right clarity. The sense that now is the moment to begin. The start keeps moving.",
    close:
      "And with it, everything that depends on it.",
  },
];
export default function StrugglesSection() {
  const [activeStruggle, setActiveStruggle] = useState(0);
  return (
      <section
        id="struggle"
        className="relative mx-auto w-full max-w-6xl scroll-mt-24 overflow-hidden px-6 pb-20 pt-12 md:pb-28 md:pt-16"
      >
        <SectionDecorations flip />
        <div className="relative z-10">
        <SectionLabel>The modern challenge</SectionLabel>
        <div className="grid gap-6 md:grid-cols-[1.1fr_.9fr] md:items-end md:gap-12">
          <h2 className="text-[clamp(3rem,5.2vw,5.5rem)] font-bold leading-[0.94] tracking-[-0.045em] text-brand-dark">
            Why do I do that<span className="text-brand-primary">?</span>
          </h2>
          <div className="max-w-2xl border-l-2 border-brand-teal/35 pl-5 font-sans text-base leading-7 text-brand-dark md:text-lg md:leading-8">
            <p>You know what needs to be done. You may even want to do it.</p>
            <ul className="my-4 space-y-2">
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                <span>And yet, you don&apos;t.</span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-secondary" />
                <span>Not always. Not completely.</span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal" />
                <span>But often enough to notice a pattern.</span>
              </li>
            </ul>
            <p className="font-serif text-xl font-bold leading-7 text-brand-dark md:text-2xl md:leading-8">
              That&apos;s the part worth paying attention to.
            </p>
          </div>
        </div>
        <div className="mt-9 md:mt-11">
          <SplitStruggleShowcase
            activeStruggle={activeStruggle}
            onSelect={setActiveStruggle}
          />
        </div>
        </div>
      </section>
  );
}

const SplitStruggleShowcase = ({
  activeStruggle,
  onSelect,
}: {
  activeStruggle: number;
  onSelect: (index: number) => void;
}) => {
  const safeActiveStruggle = Math.min(
    Math.max(activeStruggle, 0),
    struggles.length - 1,
  );

  return (
    <>
      <div className="hidden min-h-[28rem] overflow-hidden rounded-lg border border-brand-dark/12 bg-white shadow-[0_28px_80px_rgba(4,42,43,0.09)] md:grid md:grid-cols-[1fr_5.5rem] md:items-stretch">
        <article className="flex flex-col px-8 py-9 lg:px-12 lg:py-11">
          <div className="flex items-start justify-between gap-8 border-b border-brand-dark/10 pb-7">
            <div>
              {struggles[safeActiveStruggle].eyebrow && (
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                  {struggles[safeActiveStruggle].eyebrow}
                </p>
              )}
              <h3 className={`${struggles[safeActiveStruggle].eyebrow ? "mt-3" : ""} text-3xl font-bold leading-[1.02] tracking-[-0.03em] text-brand-dark lg:text-5xl`}>
                {struggles[safeActiveStruggle].title}
              </h3>
            </div>
            <span className="font-serif text-6xl font-bold leading-none text-brand-primary/15">
              {String(safeActiveStruggle + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[0.7fr_1fr] lg:items-start">
            <p className="max-w-md text-3xl font-medium leading-[1.12] text-brand-dark lg:text-4xl">
              {struggles[safeActiveStruggle].lead}
            </p>
            <div className="max-w-3xl space-y-7 font-sans text-base leading-8 text-brand-dark/75">
              <p>{struggles[safeActiveStruggle].detail}</p>
              <p className="border-l-4 border-brand-secondary pl-5 font-serif text-xl leading-8 text-brand-dark">
                {struggles[safeActiveStruggle].close}
              </p>
            </div>
          </div>
        </article>

        <div className="grid h-full auto-rows-fr border-l border-brand-dark bg-brand-dark">
          {struggles.map((item, index) => {
            const isActive = index === safeActiveStruggle;

            return (
              <button
                key={item.title}
                type="button"
                aria-expanded={isActive}
                onClick={() => onSelect(index)}
                aria-label={`Show ${item.title}`}
                className={`flex h-full w-full items-center justify-center border-b border-white/15 px-3 py-5 text-center transition duration-300 last:border-b-0 ${
                  isActive
                    ? "bg-brand-secondary"
                    : "text-white/45 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                <span
                  className={`font-serif text-3xl font-bold leading-none ${
                    isActive ? "text-brand-dark" : "text-white/45"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <MobileStruggleAccordion
        activeStruggle={safeActiveStruggle}
        onSelect={onSelect}
      />
    </>
  );
};

const MobileStruggleAccordion = ({
  activeStruggle,
  onSelect,
}: {
  activeStruggle: number;
  onSelect: (index: number) => void;
}) => (
  <div className="space-y-2 md:hidden">
    {struggles.map((item, index) => {
      const isActive = index === activeStruggle;

      return (
        <article
          key={item.title}
          className={`overflow-hidden rounded-lg border border-brand-dark/12 ${
            isActive ? "shadow-[0_16px_45px_rgba(4,42,43,0.08)]" : ""
          }`}
        >
          <button
            type="button"
            aria-expanded={isActive}
            onClick={() => onSelect(index)}
            className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition ${
              isActive ? "bg-brand-dark text-white" : "bg-white text-brand-dark hover:bg-brand-dark/[0.03]"
            }`}
          >
            <div>
              <span
                className={`font-sans text-xs font-semibold uppercase tracking-[0.18em] ${
                  isActive ? "text-white/55" : "text-brand-dark"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3
                className={`mt-2 font-sans text-base font-semibold ${
                  isActive ? "text-white" : "text-brand-dark"
                }`}
              >
                {item.title}
              </h3>
            </div>
            <span
              className={`font-serif text-4xl font-bold leading-none ${
                isActive ? "text-white/18" : "text-brand-primary/18"
              }`}
            >
              {index + 1}
            </span>
          </button>
          {isActive && (
            <div className="bg-white px-5 pb-6 pt-5">
              {item.eyebrow && (
                <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand-primary">
                  {item.eyebrow}
                </p>
              )}
              <p className="mt-3 text-2xl leading-8 text-brand-dark">
                {item.lead}
              </p>
              <div className="mt-5 space-y-4 font-sans text-sm leading-7 text-brand-dark">
                <p>{item.detail}</p>
                <p className="border-l-4 border-brand-secondary pl-4 text-base leading-7 text-brand-dark">
                  {item.close}
                </p>
              </div>
            </div>
          )}
        </article>
      );
    })}
  </div>
);


