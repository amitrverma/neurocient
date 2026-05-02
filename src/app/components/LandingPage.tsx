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
    title: "Procrastination",
    eyebrow: "Safety disguised as delay",
    lead: "You know what needs to be done. You may even want to do it.",
    detail:
      "But the task carries friction: uncertainty, exposure, the possibility of failing in public or proving something uncomfortable to yourself.",
    close:
      "Your body reads that discomfort as risk, so delay starts to feel like the safer move.",
  },
  {
    title: "Endless Distraction",
    eyebrow: "Relief beats intention",
    lead: "You sit down to focus and find yourself deep in content you never meant to open.",
    detail:
      "The work asks for effort, ambiguity, and patience. The feed offers quick reward with almost no cost of entry.",
    close:
      "Your reward system is not choosing what matters most. It is choosing what feels easier to regulate right now.",
  },
  {
    title: "The Comparison Spiral",
    eyebrow: "Status scanning on repeat",
    lead: "You track who is ahead, who is liked, who is winning.",
    detail:
      "Part of your mind keeps checking for rank, relevance, and social position because those signals once shaped access, safety, and belonging.",
    close:
      "The old status system keeps asking where you stand, even when the scoreboard is exhausting and mostly imaginary.",
  },
  {
    title: "Social Anxiety",
    eyebrow: "Belonging still feels high-stakes",
    lead: "A presentation, difficult conversation, or new group can feel far bigger than it is.",
    detail:
      "Modern situations rarely threaten survival, but your nervous system still treats social exposure as something with real consequences.",
    close:
      "Belonging once meant protection, so being seen, judged, or excluded can still trigger an outsized alarm.",
  },
  {
    title: "The Motivation Trap",
    eyebrow: "Waiting for certainty",
    lead: "You wait to feel ready before starting.",
    detail:
      "The problem is that readiness is often a false condition. Hard things usually begin before they feel emotionally safe or fully mapped.",
    close:
      "The older system keeps holding out for certainty, so action gets postponed in the name of preparation.",
  },
];

const shallowFixes = [
  {
    name: "Productivity systems",
    why: "Organize the list, but rarely explain why the list feels threatening.",
  },
  {
    name: "Motivation hacks",
    why: "Work until novelty fades and the older system takes over again.",
  },
  {
    name: "Self-discipline advice",
    why: "Treats resistance as weakness instead of information.",
  },
];

const timeline = [
  {
    era: "200,000 years ago",
    title: "Fear meant survival",
    desc: "Social rejection could mean exile from the group. Anxiety about fitting in was not weakness. It was protection.",
  },
  {
    era: "Paleolithic",
    title: "Loss aversion meant protection",
    desc: "Losing food, shelter, or allies could be catastrophic. Feeling losses more strongly than gains kept people vigilant.",
  },
  {
    era: "Pre-history",
    title: "Rest could feel risky",
    desc: "When resources were uncertain, the brain learned to treat alertness and readiness as safety strategies.",
  },
  {
    era: "Scarcity",
    title: "Craving meant opportunity",
    desc: "Calories were scarce and unpredictable. Wanting sugar and fat when available was smart survival math.",
  },
  {
    era: "Today",
    title: "The mismatch",
    desc: "Same wiring, different world. The threat is an email. The tribe signal is a post. The scarcity cue is everywhere.",
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

const awarenessSteps = [
  {
    title: "Name the pattern",
    desc: "Call the response what it is. Naming creates distance from the impulse and makes the automatic loop visible.",
  },
  {
    title: "Trace it to the drive",
    desc: "Ask which old problem the behavior is trying to solve: inclusion, kin care, status, attachment, or safety.",
  },
  {
    title: "Update the response",
    desc: "Choose a modern move that respects the need without letting the old alarm run the whole decision.",
  },
];

const helpfulTools = [
  {
    tag: "Free tool",
    title: "Spot Your Caveman",
    desc: "A quick diagnostic to identify which survival pattern is loudest in your life right now.",
    href: "/diagnostics/spot-your-caveman",
    cta: "Take the diagnostic",
  },
  {
    tag: "Micro-challenge",
    title: "The Caveman Audit",
    desc: "Small observations that train you to notice the drive beneath everyday reactions.",
    href: "/tools/microchallenges",
    cta: "Start a challenge",
  },
  {
    tag: "Deep dive",
    title: "The Inner Caveman Guide",
    desc: "The full framework: evolutionary psychology, neuroscience, and practical tools in one place.",
    href: "/inner-caveman",
    cta: "Read the guide",
  },
];

const LandingPage = () => {
  const [activeStruggle, setActiveStruggle] = useState(0);

  return (
    <div className="flex flex-col bg-white font-serif text-brand-dark">
      <section className="relative flex min-h-[calc(100vh-5rem)] items-center overflow-hidden border-b border-brand-dark/10 bg-white px-6 py-16 md:px-10 md:py-20">
        <div className="relative mx-auto w-full max-w-6xl">
          <div className="max-w-3xl">
            <p className="mb-6 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-brand-teal">
              The Neurocient Labs
            </p>
            <h1 className="max-w-4xl text-5xl font-bold leading-[1.04] text-brand-dark md:text-7xl">
              Your brain is
              <br />
              <span className="italic text-brand-accent">
                200,000 years old.
              </span>
              <br />
              Your problems aren&apos;t.
            </h1>
            <p className="mt-6 max-w-2xl font-sans text-base leading-8 text-brand-dark/72 md:text-lg">
              Modern life keeps asking ancient brains to handle endless feeds,
              vague deadlines, constant comparison, and invisible social
              pressure. Before we reveal the older system underneath, start with
              the question it leaves behind.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#struggle"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-6 py-3 font-sans text-sm font-semibold text-white shadow-sm transition hover:border-brand-primary"
              >
                Start here
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/programs"
                className="inline-flex items-center justify-center rounded-full border border-brand-dark/35 bg-white px-6 py-3 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-teal"
              >
                See programs
              </Link>
            </div>
            <div className="mt-5 hidden items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/45 md:flex">
              <span className="h-px w-10 bg-brand-dark/30" />
              <span>Scroll to understand</span>
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
        <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-brand-dark/72">
          You&apos;ve read the books. Tried the habits. Downloaded the apps. But
          something keeps pulling you back to the scroll, the snack, the safe
          choice.
          Sound familiar?
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
        <div className="grid overflow-hidden rounded-lg border border-brand-dark/10 shadow-sm md:grid-cols-2">
          <div className="bg-white p-6 md:p-8">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/50">
              The usual move
            </p>
            <h2 className="mt-3 text-2xl font-bold text-brand-dark md:text-3xl">
              Try harder. Optimize more. Blame yourself.
            </h2>
            <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72 md:text-base">
              More information can help, but it often stays above the real
              system. You can know the right thing and still feel your body pull
              away from it.
            </p>
          </div>
          <div className="bg-white p-6 md:p-8">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-dark/50">
              What it misses
            </p>
            <h2 className="mt-3 text-2xl font-bold text-brand-dark md:text-3xl">
              The drive underneath the behaviour.
            </h2>
            <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72 md:text-base">
              Avoidance may be safety. Comparison may be status monitoring.
              Scrolling may be belonging and reward. The behaviour makes more
              sense when you know which ancient button got pressed.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {shallowFixes.map((fix) => (
            <article
              key={fix.name}
              className="rounded-lg border border-brand-dark/10 bg-white p-5 shadow-sm transition hover:border-brand-teal/50"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-brand-primary/30 bg-white text-brand-primary">
                <X className="h-4 w-4" />
              </span>
              <h3 className="mt-4 font-sans text-sm font-semibold text-brand-dark">
                {fix.name}
              </h3>
              <p className="mt-2 font-sans text-sm leading-6 text-brand-dark/62">
                {fix.why}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-16 text-white md:py-24">
        <div className="mx-auto max-w-6xl">
          <SectionLabel tone="dark">A different perspective</SectionLabel>
          <h2 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
            What if it is not a <span className="italic text-brand-secondary">character flaw?</span>
          </h2>
          <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-white/72">
            We have been taught to treat these struggles as personal failures:
            things to overcome through willpower and discipline. But what if the
            real explanation is not moral? What if it is biological?
          </p>
          <blockquote className="mt-8 max-w-3xl border-l-4 border-brand-secondary bg-white/[0.04] py-4 pl-6 pr-5 text-2xl italic leading-10 text-white/92">
            We think our struggles are personal. They are often ancient programs
            running in an environment they were never built for.
          </blockquote>
          <p className="mt-8 max-w-2xl font-sans text-base leading-8 text-white/72">
            Every pattern you fight, the avoidance, craving, comparison, or
            fear, was once a feature. It kept your ancestors alive. The problem
            is not you. The problem is the mismatch.
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
            <SectionLabel>Meet the culprit</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-5xl">
              Your <span className="italic text-brand-accent">Inner Caveman</span> still runs the show.
            </h2>
            <p className="mt-5 font-sans text-base leading-8 text-brand-dark/72">
              Beneath your rational, modern mind lives an ancient brain. It does
              not care about your productivity plan for its own sake. It cares
              about five fundamental drives: belonging, kin care, status,
              attachment, and safety.
            </p>
            <p className="mt-4 font-sans text-base leading-8 text-brand-dark/72">
              The Inner Caveman is not an enemy. He is a protector operating on
              outdated information. Once you can see which drive is active, you
              can work with it instead of against yourself.
            </p>
            <Link
              href="/inner-caveman"
              className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-primary hover:underline"
            >
              Explore the full framework
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
                    <p className="mt-2 font-sans text-sm leading-6 text-brand-dark/64">
                      {drive.modern}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>The evolutionary lens</SectionLabel>
        <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-5xl">
          It made sense.
          <br />
          <span className="italic text-brand-accent">Back then.</span>
        </h2>
        <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-brand-dark/72">
          Your brain was not built for 2026. It was built for a world of scarce
          resources, uncertain safety, close kin, and constant social
          dependency. Many irrational behaviors make sense in that world.
        </p>
        <div className="mt-10 space-y-7 border-l border-brand-teal/55 pl-5 md:ml-16 md:pl-8">
          {timeline.map((item) => (
            <article key={item.title} className="relative grid gap-2 md:grid-cols-[9rem_1fr]">
              <span
                className={`absolute -left-[1.68rem] top-1 h-3 w-3 rounded-full md:-left-[2.2rem] ${
                  item.mismatch ? "bg-brand-dark" : "bg-brand-dark/45"
                }`}
              />
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark/45">
                {item.era}
              </p>
              <div>
                <h3 className="font-sans text-base font-semibold text-brand-dark">
                  {item.title}
                </h3>
                <p className="mt-1 font-sans text-sm leading-7 text-brand-dark/62">
                  {item.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[0.95fr_1.05fr] md:py-20">
        <div>
          <SectionLabel>The helpful lens</SectionLabel>
          <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-5xl">
            Awareness is the <span className="italic text-brand-accent">first update.</span>
          </h2>
          <p className="mt-5 font-sans text-base leading-8 text-brand-dark/72">
            You cannot delete the caveman. But you can learn to spot him before
            he hijacks the decision. That gap between stimulus and response is
            where the useful work begins.
          </p>
          <div className="mt-7 space-y-4">
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
                  <p className="mt-2 font-sans text-sm leading-6 text-brand-dark/64">
                    {step.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {helpfulTools.map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="block rounded-lg border border-brand-dark bg-brand-dark p-6 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-dark/95 hover:shadow-md"
            >
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                {tool.tag}
              </span>
              <h3 className="mt-3 text-2xl font-normal">{tool.title}</h3>
              <p className="mt-2 font-sans text-sm leading-7 text-white/65">
                {tool.desc}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-secondary">
                {tool.cta}
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>Diagnostic</SectionLabel>
        <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-5xl">
          Which caveman pattern
          <br />
          <span className="italic text-brand-accent">runs your life?</span>
        </h2>
        <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-brand-dark/72">
          Take a sample question from the Caveman Diagnostic, then continue to
          the full scan to identify your dominant survival pattern.
        </p>
        <div className="mt-8 overflow-hidden rounded-lg border border-brand-dark/10 shadow-sm">
          <div className="flex flex-col gap-2 bg-brand-dark px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-xl font-bold">Spot Your Caveman: Quick Sample</h3>
            <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
              Free diagnostic
            </span>
          </div>
          <div className="bg-white p-6">
            <p className="font-sans text-base leading-7 text-brand-dark">
              When you have an important task to do, which is most true for you?
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[
                "I wait until I feel ready, which often means I do not start.",
                "I get distracted by everything else and lose the thread.",
                "I start but quit when it gets uncomfortable or hard.",
                "I overthink it until the window closes.",
              ].map((option) => (
                <Link
                  key={option}
                  href="/diagnostics/caveman-scan"
                  className="rounded-lg border border-brand-dark/10 bg-white px-4 py-3 font-sans text-sm leading-6 text-brand-dark transition hover:border-brand-primary"
                >
                  {option}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 bg-white px-6 py-4 font-sans text-sm text-brand-dark/70 sm:flex-row sm:items-center sm:justify-between">
            <span>2 min. Free. No signup required.</span>
            <Link
              href="/diagnostics/caveman-scan"
              className="inline-flex items-center gap-2 font-semibold text-brand-primary hover:underline"
            >
              Take the full diagnostic
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
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
      <div className="hidden overflow-hidden rounded-[1.35rem] border border-brand-dark/10 bg-white shadow-[0_20px_60px_rgba(4,42,43,0.06)] md:grid md:grid-cols-[1fr_6.5rem] md:items-stretch">
        <div className="grid grid-rows-[1fr_auto] px-8 py-8">
          <div className="max-w-3xl self-start pt-3">
            <p className="max-w-2xl text-[2rem] leading-[1.45] text-brand-dark">
              {struggles[safeActiveStruggle].lead}
            </p>
            <div className="mt-8 max-w-2xl space-y-5 font-sans text-base leading-8 text-brand-dark/64">
              <p>{struggles[safeActiveStruggle].detail}</p>
              <p>{struggles[safeActiveStruggle].close}</p>
            </div>
          </div>

          <div className="mt-12 border-t border-brand-dark/10 pt-8">
            <h3 className="text-3xl font-bold leading-tight tracking-[-0.02em] text-brand-dark md:text-5xl whitespace-nowrap">
              {struggles[safeActiveStruggle].title}
            </h3>
          </div>
        </div>

        <div className="grid h-full auto-rows-fr border-l border-brand-dark/10 bg-brand-dark/[0.03]">
          {struggles.map((item, index) => {
            const isActive = index === safeActiveStruggle;

            return (
              <button
                key={item.title}
                type="button"
                aria-expanded={isActive}
                onClick={() => onSelect(index)}
                className={`flex h-full w-full items-center justify-center border-b border-brand-dark/10 px-3 py-5 text-center transition last:border-b-0 ${
                  isActive
                    ? "bg-white"
                    : "text-brand-dark/62 hover:bg-white/75 hover:text-brand-dark"
                }`}
              >
                <span
                  className={`font-serif text-3xl font-bold leading-none ${
                    isActive ? "text-brand-primary" : "text-brand-primary/30"
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
  <div className="md:hidden">
    {struggles.map((item, index) => {
      const isActive = index === activeStruggle;

      return (
        <article
          key={item.title}
          className="border-b border-brand-dark/10 last:border-b-0"
        >
          <button
            type="button"
            aria-expanded={isActive}
            onClick={() => onSelect(index)}
            className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
          >
            <div>
              <span className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-dark/35">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-sans text-base font-semibold text-brand-dark">
                {item.title}
              </h3>
            </div>
            <span className="font-serif text-4xl font-bold leading-none text-brand-primary/18">
              {index + 1}
            </span>
          </button>
          {isActive && (
            <div className="border-t border-brand-dark/8 px-5 pb-5 pt-4">
              <p className="font-sans text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-brand-primary/70">
                {item.eyebrow}
              </p>
              <p className="mt-3 text-xl leading-8 text-brand-dark">
                {item.lead}
              </p>
              <div className="mt-4 space-y-3 font-sans text-sm leading-7 text-brand-dark/62">
                <p>{item.detail}</p>
                <p>{item.close}</p>
              </div>
            </div>
          )}
        </article>
      );
    })}
  </div>
);

export default LandingPage;
