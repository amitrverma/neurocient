"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bookmark,
  Check,
  FlaskConical,
  Layers3,
  LoaderCircle,
  NotebookPen,
  PencilLine,
} from "lucide-react";
import { useNotification } from "@/app/components/NotificationProvider";
import {
  buildReturnQuestion,
  chooseAccountContinuation,
  type WorkOverview,
} from "./accountOverview";
import type { ProfileView } from "./profileViews";

export default function PersonalHome({
  overview,
  membershipActive,
  cohortLabel,
  preferredSavedSlug,
  onOpenProfileView,
}: {
  overview: WorkOverview;
  membershipActive: boolean;
  cohortLabel?: string | null;
  preferredSavedSlug?: string | null;
  onOpenProfileView: (view: ProfileView) => void;
}) {
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedReflection, setSavedReflection] = useState<string | null>(null);
  const [questionOverride, setQuestionOverride] = useState<string | null>(null);
  const { notify } = useNotification();
  const preferredSavedIdea = useMemo(
    () => overview.savedArticles.find((article) => article.slug === preferredSavedSlug),
    [overview.savedArticles, preferredSavedSlug],
  );
  const contextualOverview = useMemo(() => {
    if (!preferredSavedIdea) return overview;
    return {
      ...overview,
      savedArticles: [preferredSavedIdea, ...overview.savedArticles.filter((article) => article.slug !== preferredSavedSlug)],
    };
  }, [overview, preferredSavedIdea, preferredSavedSlug]);
  const question = useMemo(
    () => questionOverride ?? (preferredSavedIdea
      ? `What from “${preferredSavedIdea.title || preferredSavedIdea.slug}” feels connected to what you are dealing with now?`
      : buildReturnQuestion(contextualOverview)),
    [contextualOverview, preferredSavedIdea, questionOverride],
  );

  if (overview.status === "loading") {
    return (
      <StateBlock icon={<LoaderCircle className="animate-spin" />} title="Bringing your thread together" text="Reading your recent work and the ideas you chose to keep." />
    );
  }

  if (overview.status === "unavailable") {
    return (
      <StateBlock icon={<PencilLine />} title="Your personal thread is temporarily unavailable" text="Your work has not been treated as empty or replaced. Try again when the connection is available." />
    );
  }

  const next = chooseAccountContinuation(overview);
  const savedIdea = contextualOverview.savedArticles[0];

  const saveReflection = async () => {
    const content = reflection.trim();
    if (!content) return;
    setSaving(true);
    try {
      const response = await fetch("/api/weekly-reflection", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) throw new Error();
      setSavedReflection(content);
      setReflection("");
      notify("Reflection kept.", "success");
    } catch {
      notify("Your reflection could not be kept. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8">
      <section className="overflow-hidden rounded-xl bg-brand-dark text-white shadow-sm">
        <div className="px-6 py-7 md:px-9 md:py-9">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
            Before you continue
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.16] md:text-4xl">
            {question}
          </h2>
          {savedReflection ? (
            <div className="mt-7 border-l-2 border-brand-secondary pl-5">
              <p className="font-sans text-sm leading-7 text-white/75">{savedReflection}</p>
              <p className="mt-3 inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-secondary">
                <Check className="h-4 w-4" /> Kept in your thread
              </p>
            </div>
          ) : (
            <>
              <label htmlFor="return-reflection" className="sr-only">Your reflection</label>
              <textarea
                id="return-reflection"
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                placeholder="Write what you noticed. A few honest lines are enough."
                rows={4}
                className="mt-7 w-full resize-y rounded-lg border border-white/18 bg-white/8 px-4 py-3 font-sans text-sm leading-7 text-white outline-none placeholder:text-white/42 focus:border-brand-secondary"
              />
              <button
                type="button"
                onClick={saveReflection}
                disabled={!reflection.trim() || saving}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-secondary px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark disabled:cursor-not-allowed disabled:opacity-45"
              >
                {saving ? "Keeping…" : "Keep this reflection"}
                {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </>
          )}
        </div>
      </section>

      <section className="grid gap-px overflow-hidden rounded-xl border border-brand-dark/12 bg-brand-dark/12 md:grid-cols-2">
        <div className="bg-white p-6 md:p-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">Your developing thread</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-brand-dark">What you have been working with.</h2>
          <div className="mt-6 grid gap-5">
            {overview.practice ? (
              <ThreadItem icon={<Layers3 />} label="In Practice" text={overview.practice.moment || overview.practice.action || "A behavior loop you chose to work through."} />
            ) : null}
            {overview.activeChallengeTitle ? (
              <ThreadItem icon={<FlaskConical />} label="Experimenting with" text={overview.activeChallengeTitle} />
            ) : null}
            {overview.latestSpot ? (
              <ThreadItem icon={<NotebookPen />} label="Recently noticed" text={overview.latestSpot.description} />
            ) : null}
            {!overview.practice && !overview.activeChallengeTitle && !overview.latestSpot ? (
              <p className="font-sans text-sm leading-7 text-brand-dark/65">Your first reflection can become the beginning of this thread. Neurocient will bring it back when you return.</p>
            ) : null}
          </div>
        </div>

        <div className="bg-brand-secondary/18 p-6 md:p-8">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">One next step</p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-brand-dark">{next.label}</h2>
          <p className="mt-4 font-sans text-sm leading-7 text-brand-dark/70">{next.text}</p>
          <Link href={next.href} className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {savedIdea ? (
        <section className="rounded-xl border border-brand-dark/12 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-6 md:grid-cols-[auto_1fr_auto] md:items-start">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent"><Bookmark className="h-5 w-5" /></span>
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">An idea you chose to keep</p>
              <h2 className="mt-2 text-3xl font-bold leading-tight text-brand-dark">{savedIdea.title || savedIdea.slug}</h2>
              {savedIdea.excerpt ? <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-brand-dark/68">{savedIdea.excerpt}</p> : null}
              <div className="mt-5 flex flex-wrap gap-4 font-sans text-sm font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setQuestionOverride(`What from “${savedIdea.title || savedIdea.slug}” feels connected to what you are dealing with now?`);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="cursor-pointer text-brand-primary underline decoration-brand-primary/30 underline-offset-4"
                >
                  Bring this into reflection
                </button>
                <Link href={`/insights/${savedIdea.slug}`} className="text-brand-dark/65 underline decoration-brand-dark/20 underline-offset-4">Read again</Link>
              </div>
            </div>
            <Link href="/saved" className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent">All saved ideas <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      ) : null}

      {overview.latestReflection ? (
        <section className="border-l-4 border-brand-secondary px-5 py-2">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">From your previous reflection</p>
          <p className="mt-3 max-w-3xl font-sans text-base leading-8 text-brand-dark/74">{overview.latestReflection}</p>
        </section>
      ) : null}

      <section className="flex flex-wrap items-center justify-between gap-5 border-t border-brand-dark/12 pt-6 font-sans text-sm">
        <div className="text-brand-dark/62">
          <span>{membershipActive ? "Membership active" : "Free access"}</span>
          {cohortLabel ? <span> · {cohortLabel}</span> : null}
        </div>
        <div className="flex flex-wrap gap-4 font-semibold">
          <button onClick={() => onOpenProfileView("reflections")} className="cursor-pointer text-brand-dark hover:text-brand-primary">Past reflections</button>
          <button onClick={() => onOpenProfileView("preferences")} className="cursor-pointer text-brand-dark hover:text-brand-primary">Preferences</button>
          <button onClick={() => onOpenProfileView("settings")} className="cursor-pointer text-brand-dark hover:text-brand-primary">Account</button>
        </div>
      </section>
    </div>
  );
}

const ThreadItem = ({ icon, label, text }: { icon: React.ReactNode; label: string; text: string }) => (
  <div className="grid grid-cols-[2rem_1fr] gap-3 border-t border-brand-dark/10 pt-4 first:border-t-0 first:pt-0">
    <span className="text-brand-accent [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
    <div>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.13em] text-brand-teal">{label}</p>
      <p className="mt-1 font-sans text-sm leading-6 text-brand-dark/72">{text}</p>
    </div>
  </div>
);

const StateBlock = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <div className="rounded-xl border border-brand-dark/12 bg-white p-8">
    <span className="text-brand-accent [&>svg]:h-6 [&>svg]:w-6">{icon}</span>
    <h2 className="mt-4 text-3xl font-bold leading-tight">{title}</h2>
    <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/68">{text}</p>
  </div>
);
