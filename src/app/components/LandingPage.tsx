// app/components/LandingPage.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import Newsletter from "./Newsletter";
import {
  ArrowRight,
  Compass,
  Heart,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

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
    title: "Keep Measuring Yourself Against Others",
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

const shallowFixes = [
  {
    name: "Productivity systems",
    why: "Help organize what to do, but rarely explain why the work feels heavy in the first place.",
  },
  {
    name: "Motivation hacks",
    why: "Create short bursts of energy, until older patterns quietly take over again.",
  },
  {
    name: "Self-discipline advice",
    why: "Treat resistance as something to fight, instead of something to understand.",
  },
];

const timeline = [
  {
    era: "Early human life",
    title: "Fear meant survival",
    desc: "Staying alert to danger kept you alive. Even being pushed out of the group carried real risk.",
  },
  {
    era: "Uncertain environments",
    title: "Loss mattered more than gain",
    desc: "Losing food, shelter, or allies could be costly. Feeling losses more strongly helped you stay cautious.",
  },
  {
    era: "Constant vigilance",
    title: "Alertness meant protection",
    desc: "When danger was uncertain, noticing small signals early helped you stay alive. The mind learned to scan before it settled.",
  },
  {
    era: "Scarcity of resources",
    title: "Craving meant opportunity",
    desc: "Food wasn't guaranteed. Wanting high-energy food when it appeared was an advantage.",
  },
  {
    era: "Today",
    title: "Same wiring. Different world.",
    desc: "The threat is an email. The tribe signal is a notification. The sense of scarcity never quite turns off.",
    mismatch: true,
  },
];

const drives = [
  {
    name: "Affiliation & Belonging",
    question: "Am I included?",
    modern: "Notifications, social media, loneliness, team silence.",
    href: "/insights/connections",
    icon: Users,
  },
  {
    name: "Kin Care",
    question: "Are my people okay?",
    modern: "Caregiving, provision, responsibility, emotional load.",
    href: "/insights/alloparenting",
    icon: Heart,
  },
  {
    name: "Status & Hierarchy",
    question: "Where do I stand?",
    modern: "Performance reviews, comparison, reputation, visibility.",
    href: "/insights/why-we-compare",
    icon: Compass,
  },
  {
    name: "Mate Acquisition & Retention",
    question: "Is this bond secure?",
    modern: "Attachment, ambiguity, jealousy, replaying arguments.",
    href: "/insights/replay-arguments",
    icon: Sparkles,
  },
  {
    name: "Safety & Survival",
    question: "Am I safe enough?",
    modern: "Deadlines, uncertainty, anxiety, avoidance, overreactions.",
    href: "/insights/anticipatory-anxiety",
    icon: ShieldCheck,
  },
];

const awarenessSteps: Array<{ title: string; desc: ReactNode[] }> = [
  {
    title: "Name the pattern",
    desc: [
      "Call the response what it is.",
      "A pull to avoid. A need for reassurance. A flicker of comparison.",
      "Naming creates distance. It turns something automatic into something you can see.",
    ],
  },
  {
    title: "Trace it to the drive",
    desc: [
      "Ask what the response is trying to do.",
      "Is it looking for safety? Connection? Status?",
      <>
        The behaviour is not random. It is solving something &mdash; just not always in the right way.
      </>,
    ],
  },
  {
    title: "Update the response",
    desc: [
      "Choose a response that fits the situation you're actually in.",
      <>
        Not by suppressing the old pattern, but by recognizing the need beneath it &mdash; and responding with more context.
      </>,
    ],
  },
];

const LandingPage = () => {
  const [activeStruggle, setActiveStruggle] = useState(0);

  return (
    <div className="flex flex-col bg-white font-serif text-brand-dark">
      <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden border-b border-brand-dark/10 bg-white px-6 py-16 md:px-10 md:py-20">
        <div className="relative mx-auto w-full max-w-6xl">
          <div className="max-w-5xl">
            <div className="mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
              <span className="h-px w-12 bg-brand-dark" />
              <span>The Neurocient Labs</span>
            </div>
            <h1 className="max-w-5xl text-[clamp(3.5rem,7vw,6.75rem)] font-bold leading-[1.02] text-brand-dark">
              Your brain is
              <br />
              <span className="italic text-brand-accent">
                200,000 years old.
              </span>
              <br />
              Your world isn&apos;t.
            </h1>
            <p className="mt-8 max-w-3xl border-l-4 border-brand-secondary pl-5 font-sans text-lg leading-8 text-brand-dark md:text-xl md:leading-9">
              Constant distraction. Persistent pressure. Social comparison.
              <br />
              Low energy. Cognitive overload.
              <br />
              You weren&apos;t built for this.
              <br />
              Before anything else, start with the question modern life ignores.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#struggle"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-7 py-3.5 font-sans text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                Start here
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center justify-center rounded-full border border-brand-dark/35 bg-white px-7 py-3.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-teal hover:text-brand-teal"
              >
                See programs
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="struggle"
        className="mx-auto w-full max-w-6xl scroll-mt-24 px-6 py-14 md:py-20"
      >
        <SectionLabel>The modern challenge</SectionLabel>
        <h2 className="text-[clamp(3rem,4.2vw,4.75rem)] font-bold leading-[0.95] tracking-[-0.03em] text-brand-dark">
          Why do I do that?
        </h2>
        <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-brand-dark">
          You know what needs to be done. You may even want to do it. And yet,
          you don&apos;t. Not always. Not completely. But often enough to notice a
          pattern. That&apos;s the part worth paying attention to.
        </p>
        <div className="mt-10">
          <SplitStruggleShowcase
            activeStruggle={activeStruggle}
            onSelect={setActiveStruggle}
          />
        </div>
      </section>

      <Divider />

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>Why modern fixes fall short</SectionLabel>
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <h2 className="max-w-xl text-[clamp(2.65rem,5vw,5.4rem)] font-bold leading-[0.94] tracking-[-0.03em] text-brand-dark">
              Why Modern Fixes Fall Short
            </h2>
          </div>
          <div className="border-l-4 border-brand-secondary pl-5">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark">
              The usual move
            </p>
            <p className="mt-3 text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
              Try harder.
              <br />
              Optimize more.
              <br />
              Fix yourself.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <div className="space-y-10">
            <div className="grid gap-6 md:grid-cols-[0.76fr_1fr] md:items-start">
              <p className="text-2xl leading-9 text-brand-dark md:text-3xl md:leading-10">
                When something isn&rsquo;t working, the response is almost automatic.
              </p>
              <div className="space-y-5 font-sans text-base leading-8 text-brand-dark">
                <p>
                  Read more. Learn better systems. Build discipline. Stay consistent.
                </p>
                <p>And for a while, it does help.</p>
                <p>
                  You organize the list. You set the plan. You feel a brief sense of control.
                </p>
                <p>
                  But it doesn&rsquo;t last. Because the tools are working on the surface.
                </p>
              </div>
            </div>

            <div className="border-y border-brand-dark/12 py-8">
              <p className="max-w-3xl text-2xl font-bold leading-9 text-brand-dark md:text-3xl md:leading-10">
                Most advice operates at the level of behaviour &mdash; what you do,
                how you do it, how often you do it.
              </p>
              <div className="mt-6 grid gap-5 font-sans text-base leading-8 text-brand-dark md:grid-cols-2">
                <p>
                  It assumes that once you know better, you will do better.
                  <br />
                  But that is not how it plays out.
                </p>
              </div>
              <p className="mt-6 max-w-3xl border-l-4 border-brand-teal pl-5 text-2xl leading-9 text-brand-dark">
                You can understand exactly what needs to be done,
                <br />
                and still feel a quiet resistance pulling you away from it.
              </p>
            </div>

            <div className="grid gap-8 rounded-lg border border-brand-dark/10 bg-white p-6 shadow-sm md:grid-cols-[0.74fr_1.26fr] md:p-8 lg:p-10">
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark">
                  What it misses
                </p>
                <h3 className="mt-4 max-w-sm text-3xl font-bold leading-[1.08] tracking-[-0.015em] text-brand-dark md:text-4xl">
                  The drive underneath the behaviour.
                </h3>
              </div>
              <div className="space-y-7">
                <div className="space-y-3 border-l-4 border-brand-secondary pl-5 text-xl leading-8 text-brand-dark md:text-2xl md:leading-9">
                  <p>What looks like procrastination may be protection.</p>
                  <p>What feels like distraction may be relief.</p>
                  <p>What shows up as comparison may be status tracking.</p>
                </div>

                <p className="max-w-2xl text-2xl font-bold leading-tight text-brand-dark md:text-3xl">
                  The behaviour is not random.
                  <br />
                  It is solving something &mdash; just not the thing you think.
                </p>

                <p className="max-w-2xl font-sans text-base leading-8 text-brand-dark">
                  Most conventional approaches don&rsquo;t account for this layer.
                  They try to change the action without understanding what the action
                  is doing for you.
                </p>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              So the cycle repeats.
            </p>
            <p className="mt-4 text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
              You apply the fix.
              <br />
              It works briefly.
              <br />
              It fades.
            </p>
            <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-brand-dark">
              And slowly, the problem starts to feel like you.
            </p>
            <p className="mt-5 border-l-4 border-brand-secondary pl-5 text-2xl leading-9 text-brand-dark">
              Not disciplined enough.
              <br />
              Not focused enough.
              <br />
              Not consistent enough.
            </p>
          </div>

          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark">
              Where things break
            </p>
            <div className="mt-5 grid gap-4">
              {shallowFixes.map((fix) => (
                <article
                  key={fix.name}
                  className="rounded-lg border border-brand-dark/10 bg-white p-5 shadow-sm transition hover:border-brand-teal/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-primary/30 bg-white text-brand-primary">
                      <X className="h-4 w-4" />
                    </span>
                    <h3 className="font-sans text-sm font-semibold text-brand-dark">
                      {fix.name}
                    </h3>
                  </div>
                  <p className="mt-2 font-sans text-sm leading-6 text-brand-dark">
                    {fix.why}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8 border-t border-brand-dark/12 pt-10 md:grid-cols-[0.7fr_1fr] md:items-start">
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark">
              The deeper issue
            </p>
            <h3 className="mt-3 text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
              Most solutions are built for a version of you that is fully rational.
            </h3>
          </div>
          <div className="space-y-5 font-sans text-base leading-8 text-brand-dark">
            <p>
              But your behaviour isn&rsquo;t just driven by logic.
              <br />
              It is shaped by older systems &mdash; faster, quieter, and far more
              influential.
            </p>
            <p>
              So when the usual fixes don&rsquo;t stick,
              <br />
              the problem may not be effort.
            </p>
            <p className="border-l-4 border-brand-secondary pl-5 text-lg leading-8 text-brand-dark">
              It may be that you&rsquo;re solving for the wrong layer.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionLabel tone="dark">A different perspective</SectionLabel>
          <h2 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            What if it is not a <span className="italic text-brand-secondary">personal failing?</span>
          </h2>
          <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-white/72">
            We have been taught to treat these struggles as things to fix
            through effort.
            <br />
            To push harder. Stay disciplined. Do better.
          </p>
          <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-white/72">
            But what if the explanation sits elsewhere?
          </p>
          <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-white/72">
            What if the pattern is not a lack of will,
            <br />
            but something built deeper into how we operate?
          </p>
          <blockquote className="mt-8 max-w-3xl border-l-4 border-brand-secondary bg-white/[0.04] py-4 pl-6 pr-5 text-2xl italic leading-10 text-white/92">
            We think our struggles are personal. They are often older patterns
            running in an environment they were never built for.
          </blockquote>
          <p className="mt-8 max-w-2xl font-sans text-base leading-8 text-white/72">
            Every pattern you fight &mdash; avoidance, craving, comparison, fear &mdash;
            was once a feature. It helped you survive. The problem is not you.
            It&rsquo;s that the world changed faster than those patterns did.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Stat number="5" label="Core survival drives still shaping modern behavior." />
            <Stat number="2x" label="How much stronger losses can feel compared with equivalent gains." />
            <Stat number="95%" label="Of decisions driven by unconscious, automatic processes." />
          </div>
        </div>
      </section>

      <Divider />

      <section className="bg-white px-6 py-16 md:py-24">
        <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <SectionLabel>A closer look</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-5xl">
              Your <span className="italic text-brand-accent">Inner Caveman</span> is still in charge.
            </h2>
            <p className="mt-5 font-sans text-base leading-8 text-brand-dark">
              Beneath your rational, modern mind is an older system.
              <br />
              Faster. Automatic. Always scanning, always responding.
            </p>
            <p className="mt-4 font-sans text-base leading-8 text-brand-dark">
              It doesn&rsquo;t care about your plans for their own sake.
              <br />
              It cares about something more basic &mdash; staying safe, staying
              connected, staying relevant.
            </p>
            <p className="mt-4 font-sans text-base leading-8 text-brand-dark">
              And most of the time, it acts before you even notice.
            </p>
            <p className="mt-4 font-sans text-base leading-8 text-brand-dark">
              The Inner Caveman is not an enemy.
              <br />
              It is a protector &mdash; working with patterns that once made sense.
            </p>
            <p className="mt-4 font-sans text-base leading-8 text-brand-dark">
              The problem is not that it exists.
              <br />
              It&rsquo;s that it&rsquo;s operating in a world very different from the one it
              was built for.
            </p>
            <p className="mt-4 font-sans text-base leading-8 text-brand-dark">
              Once you begin to see which pattern is active,
              <br />
              you can work with it instead of against yourself.
            </p>
            <Link
              href="/inner-caveman"
              className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-primary hover:underline"
            >
              The Complete Guide to Your Inner Caveman
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <CavemanImage />
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl content-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {drives.map((drive) => {
            const Icon = drive.icon;

            return (
              <Link
                key={drive.name}
                href={drive.href}
                className="group border-l-2 border-brand-teal bg-white px-5 py-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-brand-accent transition group-hover:text-brand-primary" />
                  <div>
                    <h3 className="font-sans text-sm font-semibold text-brand-dark">
                      {drive.name}
                    </h3>
                    <p className="mt-1 text-lg italic leading-7 text-brand-dark">
                      {drive.question}
                    </p>
                    <p className="mt-2 font-sans text-sm leading-6 text-brand-dark">
                      {drive.modern}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="mx-auto mt-8 max-w-6xl font-sans text-base leading-8 text-brand-dark">
          These patterns are not random.
          <br />
          They come from a system shaped long before the world you live in today.
        </p>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>The evolutionary lens</SectionLabel>
        <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-5xl">
          It made sense.
          <br />
          <span className="italic text-brand-accent">Back then.</span>
        </h2>
        <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-brand-dark">
          This system was shaped in a very different world &mdash;
          <br />
          where safety was uncertain, resources were limited, and belonging mattered.
        </p>
        <p className="mt-4 max-w-2xl font-sans text-base leading-8 text-brand-dark">
          In that world, many of the patterns you struggle with today
          <br />
          were not problems.
        </p>
        <p className="mt-4 max-w-2xl font-sans text-base leading-8 text-brand-dark">
          They were advantages.
        </p>
        <div className="mt-10 space-y-7 border-l border-brand-teal/55 pl-5 md:ml-16 md:pl-8">
          {timeline.map((item) => (
            <article key={item.title} className="relative grid gap-2 md:grid-cols-[9rem_1fr]">
              <span
                className={`absolute -left-[1.68rem] top-1 h-3 w-3 rounded-full md:-left-[2.2rem] ${
                  item.mismatch ? "bg-brand-dark" : "bg-brand-dark/45"
                }`}
              />
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark">
                {item.era}
              </p>
              <div>
                <h3 className="font-sans text-base font-semibold text-brand-dark">
                  {item.title}
                </h3>
                <p className="mt-1 font-sans text-sm leading-7 text-brand-dark">
                  {item.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <div>
          <SectionLabel>A useful way to respond</SectionLabel>
          <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-5xl">
            Awareness is the <span className="italic text-brand-accent">first update.</span>
          </h2>
          <p className="mt-5 font-sans text-base leading-8 text-brand-dark">
            You cannot delete the caveman. But you can learn to spot him before
            he hijacks the decision. That gap between stimulus and response is
            where the useful work begins.
          </p>
          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {awarenessSteps.map((step, index) => (
              <article
                key={step.title}
                className="flex gap-4 rounded-lg border border-brand-dark/10 bg-white p-5"
              >
                <span className="font-serif text-3xl font-bold text-brand-primary">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-sans text-sm font-semibold text-brand-dark">
                    {step.title}
                  </h3>
                  <div className="mt-2 space-y-3 font-sans text-sm leading-6 text-brand-dark">
                    {step.desc.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
            <div className="space-y-3 rounded-lg border border-brand-dark/10 bg-white p-5 font-sans text-base leading-8 text-brand-dark">
              <p>
                You don&apos;t have to get it right every time. You just have to notice a little earlier.
              </p>
              <p>And over time, that changes how the system responds.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-[0.9fr_1fr] md:items-start md:py-16">
        <div>
          <SectionLabel>Inner Caveman Scan</SectionLabel>
          <h2 className="max-w-xl text-3xl font-bold leading-tight text-brand-dark md:text-5xl">
            The next step is to see this in yourself.
          </h2>
        </div>
        <Link
          href="/diagnostics/caveman-scan"
          className="block w-full rounded-lg border border-brand-dark bg-brand-dark p-6 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-dark/95 hover:shadow-md md:justify-self-end md:p-8"
        >
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
            Free tool
          </span>
          <h3 className="mt-3 text-2xl font-normal">Inner Caveman Scan</h3>
          <p className="mt-3 font-sans text-sm leading-7 text-white/65">
            A quick way to notice how this system shows up in your everyday decisions.
          </p>
          <p className="mt-4 font-sans text-sm leading-7 text-white/65">
            Not a test. Not a label.
            <br />
            Just a clearer view of what&apos;s already happening.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-secondary">
            Start the scan
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </section>

      <Newsletter
        variant="feature"
        subtext="Join thousands of readers getting weekly insights on the ancient wiring behind modern struggles and practical ways to work with it. No fluff. No gimmicks. Just science made human."
        logoSrc="/logo/newsletter.png"
      />
    </div>
  );
};

const CavemanImage = ({ priority = false }: { priority?: boolean }) => (
  <figure className="mx-auto w-full max-w-lg">
    <div className="overflow-hidden rounded-lg border border-brand-teal/25 bg-white p-2 shadow-sm">
      <Image
        src="/assets/inner-caveman-five-drives.png"
        alt="The Inner Caveman framework showing the puppet and five core drives"
        width={1152}
        height={1536}
        priority={priority}
        className="h-auto w-full rounded-md"
      />
    </div>
  </figure>
);

const SectionLabel = ({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) => (
  <div
    className={`mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] ${
      tone === "dark" ? "text-brand-secondary" : "text-brand-teal"
    }`}
  >
    <span>{children}</span>
    <span
      className={`h-px flex-1 ${
        tone === "dark" ? "bg-white/20" : "bg-brand-dark/15"
      }`}
    />
  </div>
);

const Stat = ({ number, label }: { number: string; label: string }) => (
  <div className="border-t border-brand-secondary/45 pt-5">
    <p className="font-serif text-5xl font-bold text-brand-secondary">
      {number}
    </p>
    <p className="mt-2 font-sans text-sm leading-6 text-white/68">{label}</p>
  </div>
);

const Divider = () => (
  <div className="mx-auto h-px w-[calc(100%-3rem)] max-w-6xl bg-brand-dark/15" />
);

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
      <div className="hidden overflow-hidden rounded-[1.35rem] border border-brand-dark/10 bg-white shadow-[0_20px_60px_rgba(4,42,43,0.06)] md:grid md:grid-cols-[1fr_5.25rem] md:items-stretch">
        <article className="px-8 py-8 lg:px-10 lg:py-9">
          <div className="flex items-start justify-between gap-8 border-b border-brand-dark/10 pb-7">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary">
                {struggles[safeActiveStruggle].eyebrow}
              </p>
              <h3 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.02em] text-brand-dark lg:text-5xl">
                {struggles[safeActiveStruggle].title}
              </h3>
            </div>
            <span className="font-serif text-5xl font-bold leading-none text-brand-primary/18">
              {String(safeActiveStruggle + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.62fr_1fr] lg:items-start">
            <p className="max-w-md text-3xl leading-tight text-brand-dark lg:text-4xl">
              {struggles[safeActiveStruggle].lead}
            </p>
            <div className="max-w-3xl space-y-6 font-sans text-base leading-8 text-brand-dark">
              <p>{struggles[safeActiveStruggle].detail}</p>
              <p className="border-l-4 border-brand-secondary pl-5 text-lg leading-8 text-brand-dark">
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
                className={`flex h-full w-full items-center justify-center border-b border-white/15 px-3 py-5 text-center transition last:border-b-0 ${
                  isActive
                    ? "bg-white"
                    : "text-white/55 hover:text-white"
                }`}
              >
                <span
                  className={`font-serif text-3xl font-bold leading-none ${
                    isActive ? "text-brand-dark" : "text-white/55"
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
  <div className="space-y-3 md:hidden">
    {struggles.map((item, index) => {
      const isActive = index === activeStruggle;

      return (
        <article
          key={item.title}
          className={`overflow-hidden border border-brand-dark/10 ${
            isActive ? "rounded-2xl shadow-[0_16px_45px_rgba(4,42,43,0.07)]" : ""
          }`}
        >
          <button
            type="button"
            aria-expanded={isActive}
            onClick={() => onSelect(index)}
            className={`flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition ${
              isActive ? "bg-brand-dark text-white" : "bg-white text-brand-dark"
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
              <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand-primary">
                {item.eyebrow}
              </p>
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

export default LandingPage;
