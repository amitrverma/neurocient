"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Compass,
  ShieldAlert,
  Users,
} from "lucide-react";
import { instinctMap } from "./instinctMap";

interface Props {
  responses: Record<string, string>;
  onRestart?: () => void;
}

const motiveLabels: Record<
  string,
  {
    title: string;
    summary: string;
    microShift: string;
    icon: typeof ShieldAlert;
  }
> = {
  "Safety & Self-Protection": {
    title: "Safety & Self-Protection",
    summary:
      "Your team may avoid uncertainty, exposure, or difficult ownership when the risk feels unclear.",
    microShift:
      "Make risk discussable early: pre-mortems, explicit ownership, and permission to re-estimate.",
    icon: ShieldAlert,
  },
  "Status & Social Hierarchy": {
    title: "Status & Social Hierarchy",
    summary:
      "Rank, visibility, and perceived competence may be shaping who speaks, owns, challenges, or pauses.",
    microShift:
      "Reduce status cost: leader-last discussions, structured dissent, and visible recovery norms.",
    icon: Compass,
  },
  "Affiliation & Belonging": {
    title: "Affiliation & Belonging",
    summary:
      "Harmony and inclusion may be protected at the cost of candor, clarity, and timely conflict.",
    microShift:
      "Make dissent socially safe: rotating challenger roles, anonymous checks, and explicit repair rituals.",
    icon: Users,
  },
};

const countMotives = (responses: Record<string, string>) => {
  const motiveCount: Record<string, number> = {
    "Safety & Self-Protection": 0,
    "Status & Social Hierarchy": 0,
    "Affiliation & Belonging": 0,
  };
  let noIssueCount = 0;

  Object.entries(responses).forEach(([qId, choice]) => {
    const entry = instinctMap[qId]?.[choice];
    if (entry?.motive && Object.hasOwn(motiveCount, entry.motive)) {
      motiveCount[entry.motive]++;
    } else {
      noIssueCount++;
    }
  });

  return { motiveCount, noIssueCount };
};

const ResultSummary = ({ responses, onRestart }: Props) => {
  const { motiveCount, noIssueCount } = countMotives(responses);

  const totalResponses =
    Object.values(motiveCount).reduce((sum, val) => sum + val, 0) + noIssueCount;
  const cavemanScore = Object.values(motiveCount).reduce(
    (sum, val) => sum + val,
    0,
  );
  const cavemanPercent =
    totalResponses > 0 ? Math.round((cavemanScore / totalResponses) * 100) : 0;
  const modernPercent = 100 - cavemanPercent;

  const sortedMotives = Object.entries(motiveCount)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const topMotive = sortedMotives[0]?.[0] || "No dominant instinct";

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="px-6 py-12 md:py-16">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <div className="mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
              <span>CIC result</span>
              <span className="h-px flex-1 bg-brand-dark/15" />
            </div>

            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              Workplace instinct profile
            </p>
            <h1 className="mt-3 text-[clamp(2.45rem,5vw,5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-brand-dark">
              Your team&apos;s
              <br />
              <span className="italic text-brand-accent">caveman pattern</span>
            </h1>
            <p className="mt-6 max-w-xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark md:text-lg">
              This is not a personality label. It is a read on which ancient
              workplace instincts may be influencing execution, candor,
              ownership, and energy.
            </p>
          </div>

          <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-[0_20px_60px_rgba(4,42,43,0.06)] md:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <ScoreTile label="Instinct pressure" value={cavemanPercent} />
              <ScoreTile label="Clear operating space" value={modernPercent} />
            </div>

            <div className="mt-7">
              <div className="mb-3 flex items-center justify-between font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark/60">
                <span>Ancient pressure</span>
                <span>Modern design</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-brand-dark/10">
                <div
                  className="h-full rounded-full bg-brand-accent transition-all duration-500"
                  style={{ width: `${cavemanPercent}%` }}
                />
              </div>
            </div>

            <p className="mt-6 font-sans text-sm leading-7 text-brand-dark/72">
              Dominant signal:{" "}
              <strong className="text-brand-dark">{topMotive}</strong>. The
              useful move is to design around that pressure instead of asking
              people to simply be braver, clearer, or more disciplined.
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
              The percentage matters less than the motive.
            </h2>
          </div>

          <div className="grid gap-4">
            {sortedMotives.length > 0 ? (
              sortedMotives.map(([motive, count], index) => {
                const item = motiveLabels[motive];
                const Icon = item.icon;

                return (
                  <article
                    key={motive}
                    className="rounded-lg border border-white/16 bg-white p-5 text-brand-dark shadow-sm md:p-6"
                  >
                    <div className="flex flex-wrap items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.14em]">
                      <span className="text-brand-primary">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-brand-teal">{count} triggers</span>
                    </div>
                    <div className="mt-3 flex items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-2xl font-bold leading-tight text-brand-dark">
                          {item.title}
                        </h3>
                        <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
                          {item.summary}
                        </p>
                        <p className="mt-4 border-t border-brand-dark/12 pt-4 font-sans text-sm font-semibold leading-6 text-brand-dark">
                          Try this: {item.microShift}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <article className="rounded-lg border border-white/16 bg-white p-6 text-brand-dark shadow-sm">
                <h3 className="text-2xl font-bold leading-tight text-brand-dark">
                  No major instinct pattern surfaced.
                </h3>
                <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
                  Your answers suggest the listed workplace frictions may not be
                  dominant right now. Revisit the diagnostic when a team pattern
                  becomes more visible.
                </p>
              </article>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 py-12 md:py-14">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <ResultAction
            icon={<BriefcaseBusiness className="h-5 w-5" />}
            label="Program"
            title="Bring Caveman in the Cubicle to work"
            text="Use the program page to decode team silence, ownership gaps, decision loops, and hierarchy effects."
            href="/caveman-cubicle"
            cta="Open program"
          />
          <ResultAction
            icon={<Compass className="h-5 w-5" />}
            label="Diagnostics"
            title="Compare with the personal scan"
            text="See how your individual Inner Caveman patterns may interact with the professional ones."
            href="/diagnostics/caveman-scan"
            cta="Take scan"
          />
          <ResultAction
            icon={<Users className="h-5 w-5" />}
            label="Insights"
            title="Read workplace patterns"
            text="Explore workplace-specific essays on groupthink, reviews, team silence, and leadership behavior."
            href="/tags/caveman-in-the-cubicle"
            cta="Browse workplace insights"
          />
        </div>
        {onRestart && (
          <div className="mx-auto mt-8 max-w-6xl border-t border-brand-dark/12 pt-6">
            <button
              onClick={onRestart}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
            >
              Retake diagnostic
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

const ScoreTile = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-lg border border-brand-dark/12 p-4">
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
      {label}
    </p>
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
  icon: React.ReactNode;
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

export default ResultSummary;
