"use client";

import Link from "next/link";
import {
  ArrowRight,
  Brain,
  BookOpen,
  Compass,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import type { ReactNode } from "react";

interface ScanResponse {
  type: "caveman" | "modern";
  reflection: string;
}

interface Props {
  responses: ScanResponse[];
  onRestart?: () => void;
}

const signalMap = [
  {
    trigger: "Ambiguous work",
    instinct: "Energy protection",
    oldLogic: "If the task is unclear or effortful, move toward something safer.",
    modernRead: "You may dress avoidance up as productivity when the real issue is uncertainty.",
    microShift: "Shrink the first step until it feels almost too small to resist.",
    href: "/insights/evolutionary-lag",
  },
  {
    trigger: "Someone else's win",
    instinct: "Status tracking",
    oldLogic: "Rank used to shape safety, access, and influence.",
    modernRead: "Comparison may feel like information, but it can quietly steal momentum.",
    microShift: "Name what the comparison is protecting before deciding what it means.",
    href: "/insights/why-we-compare",
  },
  {
    trigger: "Group chat pull",
    instinct: "Social vigilance",
    oldLogic: "Tribe chatter could carry signals you could not afford to miss.",
    modernRead: "A notification can feel urgent even when nothing important is happening.",
    microShift: "Give connection a container: check later, deliberately, instead of reactively.",
    href: "/insights/doomscrolling",
  },
  {
    trigger: "Reading reactions",
    instinct: "Belonging scan",
    oldLogic: "Being out of sync with the group once carried real social risk.",
    modernRead: "You may monitor other people so closely that your own experience disappears.",
    microShift: "Ask: is there evidence of disconnection, or only a body-level alarm?",
    href: "/insights/connections",
  },
  {
    trigger: "Public exposure",
    instinct: "Spotlight protection",
    oldLogic: "Being watched meant status judgment, vulnerability, and possible exclusion.",
    modernRead: "The fear may be old exposure circuitry, not a true measure of readiness.",
    microShift: "Move with the alarm present. Do not wait to feel fully safe.",
    href: "/insights/spotlight-bias",
  },
  {
    trigger: "High-reward food",
    instinct: "Scarcity capture",
    oldLogic: "If dense calories appeared, taking them was good survival math.",
    modernRead: "The craving may be opportunity detection, not actual need.",
    microShift: "Add a pause before the reward. Make the first choice delay, not denial.",
    href: "/insights/stress-comfort-food",
  },
  {
    trigger: "Being ignored",
    instinct: "Status defense",
    oldLogic: "Dismissal in the group could signal falling rank or social danger.",
    modernRead: "Pulling back may protect dignity in the moment while costing influence later.",
    microShift: "Re-enter through a lower-threat channel: a follow-up note, question, or one-on-one.",
    href: "/insights/silent-team",
  },
  {
    trigger: "End-of-day effort",
    instinct: "Fuel conservation",
    oldLogic: "Spend energy only when the return is immediate or survival-relevant.",
    modernRead: "Rest can be real, but your brain may also overprotect the fuel tank.",
    microShift: "Trade intensity for continuity: two minutes, one set, or a walk counts.",
    href: "/insights/struggle-to-exercise",
  },
  {
    trigger: "Broken streak",
    instinct: "Abort reflex",
    oldLogic: "If a strategy failed in the wild, switching fast could save energy.",
    modernRead: "One missed day can feel like evidence that the whole identity has failed.",
    microShift: "Use a restart rule: never miss twice, and never negotiate the restart.",
    href: "/insights/willpower",
  },
];

const profileCopy = {
  high: {
    label: "Instinct-led right now",
    headline: "Your ancient system is doing a lot of the steering.",
    body:
      "This does not mean you are irrational. It means your brain is trying to protect energy, belonging, status, or certainty before your modern goals get a vote.",
  },
  mixed: {
    label: "Split signal",
    headline: "You are already catching the caveman in some moments.",
    body:
      "Your pattern is not fixed. Some scenarios show old survival logic taking over; others show a modern override already coming online.",
  },
  low: {
    label: "Modern override active",
    headline: "You are often able to notice the signal without obeying it.",
    body:
      "The caveman still speaks first. Your answers suggest you are increasingly able to pause, interpret the alarm, and choose a better response.",
  },
};

const getProfile = (cavemanPercent: number) => {
  if (cavemanPercent >= 67) return profileCopy.high;
  if (cavemanPercent >= 34) return profileCopy.mixed;
  return profileCopy.low;
};

const CavemanScanResult = ({ responses, onRestart }: Props) => {
  const total = responses.length || 1;
  const cavemanCount = responses.filter((r) => r.type === "caveman").length;
  const cavemanPercent = Math.round((cavemanCount / total) * 100);
  const modernPercent = 100 - cavemanPercent;
  const profile = getProfile(cavemanPercent);

  const cavemanSignals = responses
    .map((response, index) => ({ response, signal: signalMap[index] }))
    .filter(({ response, signal }) => response.type === "caveman" && signal);

  const modernSignals = responses
    .map((response, index) => ({ response, signal: signalMap[index] }))
    .filter(({ response, signal }) => response.type === "modern" && signal);

  const primarySignals =
    cavemanSignals.length > 0 ? cavemanSignals.slice(0, 3) : modernSignals.slice(0, 3);

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="px-6 py-12 md:py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <div className="mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
              <span>Your scan</span>
              <span className="h-px flex-1 bg-brand-dark/15" />
            </div>

            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              {profile.label}
            </p>
            <h1 className="mt-3 text-[clamp(2.45rem,5vw,5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-brand-dark">
              Your Caveman
              <br />
              <span className="italic text-brand-accent">Snapshot</span>
            </h1>
            <p className="mt-6 max-w-xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark md:text-lg">
              {profile.headline}
            </p>
          </div>

          <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-[0_20px_60px_rgba(4,42,43,0.06)] md:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <ScoreTile label="Caveman pull" value={cavemanPercent} icon={<ShieldAlert className="h-5 w-5" />} />
              <ScoreTile label="Modern override" value={modernPercent} icon={<Brain className="h-5 w-5" />} />
            </div>

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark/60">
                <span>Instinct</span>
                <span>Choice</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-brand-dark/10">
                <div
                  className="h-full rounded-full bg-brand-accent transition-all duration-500"
                  style={{ width: `${cavemanPercent}%` }}
                />
              </div>
            </div>

            <p className="mt-6 font-sans text-sm leading-7 text-brand-dark/72">
              {profile.body} This is not a scorecard. It is a map of where old
              survival logic may be entering modern decisions.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-12 text-white md:py-14">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <div className="mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
              <span>What showed up</span>
              <span className="h-px flex-1 bg-white/20" />
            </div>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
              The useful part is not the percentage.
              <br />
              It is the pattern.
            </h2>
          </div>

          <div className="grid gap-4">
            {primarySignals.map(({ signal }, index) => (
              <article
                key={signal.trigger}
                className="rounded-lg border border-white/16 bg-white p-5 text-brand-dark shadow-sm md:p-6"
              >
                <div className="flex flex-wrap items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.14em]">
                  <span className="text-brand-primary">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-brand-teal">{signal.trigger}</span>
                </div>
                <h3 className="mt-3 text-2xl font-bold leading-tight text-brand-dark">
                  {signal.instinct}
                </h3>
                <div className="mt-4 grid gap-4 font-sans text-sm leading-7 text-brand-dark/72 md:grid-cols-2">
                  <p>
                    <strong className="text-brand-dark">Old logic:</strong>{" "}
                    {signal.oldLogic}
                  </p>
                  <p>
                    <strong className="text-brand-dark">Modern read:</strong>{" "}
                    {signal.modernRead}
                  </p>
                </div>
                <div className="mt-5 flex flex-col gap-4 border-t border-brand-dark/12 pt-4 md:flex-row md:items-center md:justify-between">
                  <p className="font-sans text-sm font-semibold leading-6 text-brand-dark">
                    Try this: {signal.microShift}
                  </p>
                  <Link
                    href={signal.href}
                    className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent"
                  >
                    Read more
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:py-14">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <ResultAction
            icon={<Compass className="h-5 w-5" />}
            label="Go deeper"
            title="Read the full Inner Caveman guide"
            text="Understand the five drives behind safety, status, belonging, scarcity, and control."
            href="/inner-caveman"
            cta="Open guide"
          />
          <ResultAction
            icon={<Wrench className="h-5 w-5" />}
            label="Tools"
            title="Use this insight in daily life"
            text="Turn the snapshot into small actions with spots, microchallenges, nudges, and reflection tools."
            href="/tools"
            cta="Open tools"
          />
          <ResultAction
            icon={<BookOpen className="h-5 w-5" />}
            label="Insights"
            title="Read the patterns behind your result"
            text="Explore essays on comparison, procrastination, stress, cravings, attention, and belonging."
            href="/insights"
            cta="Browse insights"
          />
        </div>
        {onRestart && (
          <div className="mx-auto mt-8 max-w-6xl border-t border-brand-dark/12 pt-6">
            <Link
              href="/diagnostics/cic"
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
            >
              See how your Inner Caveman plays out at work
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
};

const ScoreTile = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) => (
  <div className="rounded-lg border border-brand-dark/12 p-4">
    <div className="flex items-center justify-between gap-4 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
      <span>{label}</span>
      <span className="text-brand-accent">{icon}</span>
    </div>
    <p className="mt-3 font-sans text-4xl font-semibold tracking-[-0.03em] text-brand-dark">
      {value}%
    </p>
  </div>
);

const ResultAction = ({
  icon,
  label,
  title,
  text,
  href,
  cta,
}: {
  icon: ReactNode;
  label: string;
  title: string;
  text: string;
  href: string;
  cta: string;
}) => (
  <Link
    href={href}
    className="group rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm transition hover:border-brand-teal/60 hover:shadow-md"
  >
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
      {icon}
    </span>
    <p className="mt-5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
      {label}
    </p>
    <h3 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
      {title}
    </h3>
    <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">{text}</p>
    <span className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent">
      {cta}
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </span>
  </Link>
);

export default CavemanScanResult;
