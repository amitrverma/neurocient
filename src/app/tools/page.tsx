"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ClipboardList, Lock, NotebookPen } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import StreakBar from "../components/tools/StreakBar";
import AuthModal from "../components/AuthModal";

interface Spot {
  date: string;
  description: string;
}

const spotIntro =
  "Notice the moments when ancient wiring takes the wheel: avoidance, comparison, overreaction, status scanning, or the pull toward easy relief.";

const microIntro =
  "Small, science-backed experiments that help you practice with your wiring instead of relying on willpower.";

const ToolsPage = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const { user } = useAuth();

  const streak = { current: 7, longest: 15 };
  const microSummary = {
    completed: 3,
    total: 5,
    current: "Hydrate Like a Caveman",
  };

  useEffect(() => {
    const fetchSpots = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/spots/", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch spots: ${res.statusText}`);
        }

        const data = await res.json();
        setSpots(data);
      } catch (err) {
        console.error("Error loading spots:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, [user]);

  const spotCount = spots.length;
  const latestSpot =
    spotCount > 0
      ? [...spots].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        )[spotCount - 1]
      : null;

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="mx-auto w-full max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <SectionLabel>Tools</SectionLabel>
            <h1 className="text-[clamp(2.6rem,4.8vw,5rem)] font-bold leading-[0.98] tracking-[-0.03em] text-brand-dark">
              Practice the
              <br />
              <span className="italic text-brand-accent">new response.</span>
            </h1>
            <p className="mt-6 max-w-xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark">
              A working space for spotting patterns, running micro-experiments,
              and building awareness through repetition.
            </p>
          </div>

          <div className="space-y-5">
            <StreakBar current={streak.current} longest={streak.longest} />
            {!user ? (
              <div className="rounded-lg border border-brand-dark/10 bg-white p-5 shadow-sm">
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                  Sign in required
                </p>
                <p className="mt-2 font-sans text-sm leading-7 text-brand-dark/72">
                  Log in to view your saved spots, assigned microchallenges,
                  and progress.
                </p>
                <button
                  onClick={() => setShowAuth(true)}
                  className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Log in
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-14 md:pb-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <ToolCard
            eyebrow="Awareness log"
            title="Spot Your Inner Caveman"
            icon={<NotebookPen className="h-5 w-5" />}
            description={spotIntro}
            href="/tools/spots"
            cta="Open spots"
            disabled={!user}
            onRequireAuth={() => setShowAuth(true)}
            stat={
              loading
                ? "Loading spots..."
                : user
                  ? `${spotCount} ${spotCount === 1 ? "spot" : "spots"} logged`
                  : "Log in to view your spots"
            }
          >
            {user && latestSpot ? (
              <p className="mt-4 border-l-4 border-brand-secondary pl-4 font-sans text-sm leading-7 text-brand-dark/72">
                Latest: "{latestSpot.description}"
              </p>
            ) : null}
          </ToolCard>

          <ToolCard
            eyebrow="Daily experiment"
            title="Microchallenges"
            icon={<ClipboardList className="h-5 w-5" />}
            description={microIntro}
            href="/tools/microchallenges"
            cta="Open challenges"
            disabled={!user}
            onRequireAuth={() => setShowAuth(true)}
            stat={
              user
                ? `${microSummary.completed}/${microSummary.total} challenges completed`
                : "Log in to view your microchallenges"
            }
          >
            {user && microSummary.current ? (
              <p className="mt-4 border-l-4 border-brand-secondary pl-4 font-sans text-sm leading-7 text-brand-dark/72">
                Current: "{microSummary.current}"
              </p>
            ) : null}
          </ToolCard>
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-14 text-white md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.78fr_1.22fr] md:items-start">
          <div>
            <SectionLabel tone="dark">How this works</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
              Small logs.
              <br />
              Better pattern recognition.
            </h2>
          </div>
          <div className="grid gap-5 font-sans text-base leading-8 text-white/72 md:grid-cols-3">
            <p>Name the moment instead of judging it.</p>
            <p>Run one small experiment instead of forcing a total reset.</p>
            <p>Use repetition to make the useful response easier to reach.</p>
          </div>
        </div>
      </section>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </main>
  );
};

const ToolCard = ({
  eyebrow,
  title,
  icon,
  description,
  href,
  cta,
  disabled,
  onRequireAuth,
  stat,
  children,
}: {
  eyebrow: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  href: string;
  cta: string;
  disabled: boolean;
  onRequireAuth: () => void;
  stat: string;
  children?: React.ReactNode;
}) => {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight text-brand-dark">
            {title}
          </h2>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
          {icon}
        </span>
      </div>

      <p className="mt-4 font-sans text-sm leading-7 text-brand-dark/72">
        {description}
      </p>
      <p className="mt-5 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-primary">
        {stat}
      </p>
      {children}
      <span className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent">
        {disabled ? <Lock className="h-4 w-4" /> : null}
        {cta}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </span>
    </>
  );

  if (disabled) {
    return (
      <button
        type="button"
        onClick={onRequireAuth}
        className="group w-full cursor-pointer rounded-lg border border-brand-dark/10 bg-white p-6 text-left shadow-sm transition hover:border-brand-teal/60 hover:shadow-md md:p-7"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="group block cursor-pointer rounded-lg border border-brand-dark/10 bg-white p-6 shadow-sm transition hover:border-brand-teal/60 hover:shadow-md md:p-7"
    >
      {content}
    </Link>
  );
};

const SectionLabel = ({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
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

export default ToolsPage;
