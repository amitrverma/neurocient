"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  FlaskConical,
  Layers3,
  LoaderCircle,
  NotebookPen,
  PencilLine,
} from "lucide-react";
import NudgeOfTheDay from "@/app/components/tools/NudgeOfTheDay";
import WeeklyReflections from "@/app/components/tools/WeeklyReflections";
import {
  chooseAccountContinuation,
  type AccountContinuation,
  type WorkOverview,
} from "./accountOverview";

type CohortEnrollment = {
  status: string;
  cohort: { title: string; starts_at: string; timezone: string };
  next_session?: { title: string; starts_at: string; ends_at: string } | null;
};

export default function PersonalHome({
  overview,
  cohortEnrollment,
  onRetry,
}: {
  overview: WorkOverview;
  cohortEnrollment: CohortEnrollment | null;
  onRetry: () => void;
}) {
  if (overview.status === "loading") {
    return (
      <StateBlock
        icon={<LoaderCircle className="animate-spin" />}
        title="Bringing your account together"
        text="Loading your current work and the ideas you chose to keep."
      />
    );
  }

  if (overview.status === "unavailable") {
    return (
      <StateBlock
        icon={<PencilLine />}
        title="Your account overview is temporarily unavailable"
        text="Your saved work has not been treated as empty or replaced."
        action={
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:bg-brand-dark hover:text-white"
          >
            Try again
            <ArrowRight className="h-4 w-4" />
          </button>
        }
      />
    );
  }

  const continuation = chooseAccountContinuation(overview);
  const workItems = buildWorkItems(overview).filter(
    (item) => item.kind !== continuation.kind,
  );

  return (
    <div className="grid gap-14 md:gap-16">
      <section aria-labelledby="for-you-title">
        <SectionHeading
          eyebrow="For you"
          id="for-you-title"
        />
        <div className="mt-7 grid gap-5 lg:grid-cols-2 lg:items-start">
          <NudgeOfTheDay />
          <WeeklyReflections />
        </div>
      </section>

      <section aria-labelledby="current-work-title">
        <SectionHeading
          eyebrow="Continue your work"
          title="Pick up from where you left off."
          id="current-work-title"
        />

        <div className="mt-7 grid border-y border-brand-dark/12 lg:grid-cols-[1.05fr_0.95fr]">
          <PrimaryContinuation continuation={continuation} />
          <div className="border-t border-brand-dark/12 lg:border-l lg:border-t-0 lg:pl-8">
            {workItems.map((item) => (
              <WorkLink key={item.kind} item={item} />
            ))}
          </div>
        </div>
      </section>

      {cohortEnrollment ? (
        <section aria-labelledby="program-title">
          <SectionHeading
            eyebrow="Your program"
            title="Your facilitated work, in one place."
            id="program-title"
          />
          <div className="mt-7 grid gap-5 border-y border-brand-dark/12 py-7 md:grid-cols-[1fr_auto] md:items-center md:py-8">
            <div className="grid grid-cols-[2.75rem_1fr] gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.15em] text-brand-teal">
                  {cohortEnrollment.status}
                </p>
                <h3 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
                  {cohortEnrollment.cohort.title}
                </h3>
                {cohortEnrollment.next_session ? (
                  <p className="mt-2 font-sans text-sm leading-7 text-brand-dark/68">
                    Next: {cohortEnrollment.next_session.title} · {formatSessionDate(cohortEnrollment.next_session.starts_at)}
                  </p>
                ) : null}
              </div>
            </div>
            <Link
              href="/modern-caveman"
              className="inline-flex min-h-11 items-center gap-2 font-sans text-sm font-semibold text-brand-accent transition hover:text-brand-primary"
            >
              Open your program
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      ) : null}

      {overview.savedArticles.length > 0 ? (
        <section aria-labelledby="saved-title">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <SectionHeading
              eyebrow="Saved for later"
              title="Ideas you chose to keep."
              id="saved-title"
            />
            <Link
              href="/saved"
              className="inline-flex min-h-11 items-center gap-2 font-sans text-sm font-semibold text-brand-accent transition hover:text-brand-primary"
            >
              All saved insights
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-7 border-y border-brand-dark/12">
            {overview.savedArticles.slice(0, 3).map((article) => (
              <Link
                key={article.slug}
                href={`/insights/${article.slug}`}
                className="group grid gap-3 border-b border-brand-dark/12 py-6 last:border-b-0 md:grid-cols-[2.75rem_1fr_auto] md:items-start md:gap-5"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
                  <Bookmark className="h-5 w-5" />
                </span>
                <span>
                  <strong className="block text-xl leading-tight text-brand-dark transition group-hover:text-brand-primary md:text-2xl">
                    {article.title || article.slug}
                  </strong>
                  {article.excerpt ? (
                    <span className="mt-2 block max-w-3xl font-sans text-sm leading-7 text-brand-dark/66">
                      {article.excerpt}
                    </span>
                  ) : null}
                </span>
                <ArrowRight className="hidden h-4 w-4 text-brand-accent transition group-hover:translate-x-1 md:block" />
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

type WorkItem = AccountContinuation & {
  icon: ReactNode;
  status: string;
};

const buildWorkItems = (overview: WorkOverview): WorkItem[] => [
  {
    kind: "practice",
    href: "/practice",
    label: overview.practice ? "Your current Practice" : "Practice",
    status: overview.practice?.moment || overview.practice?.action || "No current Practice yet.",
    text: "Understand one recurring behaviour and choose a response that fits it.",
    icon: <Layers3 />,
  },
  {
    kind: "microchallenge",
    href: "/tools/microchallenges",
    label: overview.activeChallengeTitle || "Microchallenges",
    status: overview.activeChallengeTitle
      ? overview.activeChallengeLoggedToday
        ? "Today’s repetition is logged."
        : "Your current experiment is ready to continue."
      : overview.challengeCount > 0
        ? `${overview.challengeCount} ${overview.challengeCount === 1 ? "experiment" : "experiments"} in your history.`
        : "No active experiment.",
    text: "Try a small behaviour repeatedly and see what changes.",
    icon: <FlaskConical />,
  },
  {
    kind: "spots",
    href: "/tools/spots",
    label: "Spots",
    status: overview.latestSpot?.description || (
      overview.spotCount > 0
        ? `${overview.spotCount} ${overview.spotCount === 1 ? "spot" : "spots"} recorded.`
        : "No spots recorded yet."
    ),
    text: "Keep a concrete record of situations and automatic responses.",
    icon: <NotebookPen />,
  },
];

const PrimaryContinuation = ({
  continuation,
}: {
  continuation: AccountContinuation;
}) => (
  <div className="bg-brand-dark px-6 py-8 text-white md:px-8 md:py-10">
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
      One next step
    </p>
    <h3 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
      {continuation.label}
    </h3>
    <p className="mt-4 max-w-xl font-sans text-sm leading-7 text-white/72">
      {continuation.text}
    </p>
    <Link
      href={continuation.href}
      className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-secondary px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:bg-white"
    >
      Continue
      <ArrowRight className="h-4 w-4" />
    </Link>
  </div>
);

const WorkLink = ({ item }: { item: WorkItem }) => (
  <Link
    href={item.href}
    className="group grid grid-cols-[2.5rem_1fr_auto] gap-4 border-b border-brand-dark/12 py-6 last:border-b-0"
  >
    <span className="text-brand-accent [&>svg]:h-5 [&>svg]:w-5">{item.icon}</span>
    <span>
      <strong className="block font-sans text-sm text-brand-dark transition group-hover:text-brand-primary">
        {item.label}
      </strong>
      <span className="mt-1 block font-sans text-sm leading-6 text-brand-dark/68">
        {item.status}
      </span>
    </span>
    <ArrowRight className="h-4 w-4 text-brand-accent transition group-hover:translate-x-1" />
  </Link>
);

const SectionHeading = ({
  eyebrow,
  title,
  id,
}: {
  eyebrow: string;
  title?: string;
  id: string;
}) => (
  <div className="max-w-3xl">
    {title ? (
      <>
        <p className="page-eyebrow text-brand-teal">{eyebrow}</p>
        <h2 id={id} className="mt-3 text-3xl font-bold leading-[1.08] text-brand-dark md:text-4xl">
          {title}
        </h2>
      </>
    ) : (
      <h2 id={id} className="page-eyebrow text-brand-teal">
        {eyebrow}
      </h2>
    )}
  </div>
);

const StateBlock = ({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}) => (
  <div className="border-y border-brand-dark/12 bg-white py-8" aria-live="polite">
    <span className="text-brand-accent [&>svg]:h-6 [&>svg]:w-6">{icon}</span>
    <h2 className="mt-4 text-3xl font-bold leading-tight">{title}</h2>
    <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/68">{text}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);

const formatSessionDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
