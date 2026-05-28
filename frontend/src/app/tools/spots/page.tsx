"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  LoaderCircle,
  NotebookPen,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import CavemanSpot from "../../components/ui/CavemanSpot";
import AuthModal from "../../components/AuthModal";
import { usageLimits } from "../../utils/usage";

interface Spot {
  date: string;
  description: string;
}

const relatedInsights = [
  {
    title: "Still Running on Caveman Code",
    href: "/insights/evolutionary-lag",
  },
  {
    title: "Why We Compare",
    href: "/insights/why-we-compare",
  },
  {
    title: "Why Your Inner Caveman Keeps Doomscrolling",
    href: "/insights/doomscrolling",
  },
];

const SpotsPage = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const { user, ready } = useAuth();

  useEffect(() => {
    const fetchSpots = async () => {
      if (!ready) return;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/spots/", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to fetch spots: ${res.statusText}`);

        const data = await res.json();
        setSpots(data);
      } catch (err) {
        console.error("Error loading spots:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, [user, ready]);

  const userLimit = usageLimits.user.spots || 0;
  const hasReachedLimit = Boolean(user && spots.length >= userLimit);
  const sortedSpots = [...spots].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-6 pt-12 md:grid-cols-[0.78fr_1.22fr] md:items-start md:pb-8 md:pt-16">
        <div>
          <SectionLabel>Awareness log</SectionLabel>
          <h1 className="text-[clamp(2.6rem,5vw,5.1rem)] font-bold leading-[0.98] tracking-[-0.03em] text-brand-dark">
            Spot the pattern
            <br />
            <span className="italic text-brand-accent">while it is active.</span>
          </h1>
          <p className="mt-6 max-w-xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark">
            A place to record the small moments when ancient wiring shows up:
            avoidance, comparison, defensiveness, craving, or the need for
            reassurance.
          </p>
        </div>

        <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                Your log
              </p>
              <h2 className="mt-2 text-3xl font-bold leading-tight text-brand-dark">
                {loading ? "Loading spots" : `${spots.length} spots logged`}
              </h2>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
              {loading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : (
                <NotebookPen className="h-5 w-5" />
              )}
            </span>
          </div>
          <p className="mt-4 font-sans text-sm leading-7 text-brand-dark/72">
            Do not make the entry perfect. Name the moment in plain language so
            you can notice it earlier next time.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 pb-14 md:grid-cols-[0.78fr_1.22fr] md:items-start md:pb-16">
        <div>
          {user && !hasReachedLimit && (
            <CavemanSpot
              prompt="What is one caveman instinct you noticed today?"
              onAdded={(spot) => setSpots((prev) => [spot, ...prev])}
            />
          )}

          {hasReachedLimit && (
            <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                Limit reached
              </p>
              <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
                You have reached your free limit of {userLimit} spots.
              </p>
              <Link
                href="/membership"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90"
              >
                Become a member
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {!loading && !user && (
            <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                Sign in required
              </p>
              <h2 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
                Log in to start your awareness log.
              </h2>
              <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
                Your spots are private entries. Sign in to save them, revisit
                patterns, and build a record of what your Inner Caveman tends
                to protect.
              </p>
              <button
                onClick={() => setShowAuth(true)}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90"
              >
                Log in
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="mb-5 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
            <span>Recent spots</span>
            <span className="h-px flex-1 bg-brand-dark/15" />
          </div>

          {loading ? (
            <LoadingBlock label="Loading your saved spots" />
          ) : user && sortedSpots.length === 0 ? (
            <EmptyBlock
              title="No spots logged yet."
              text="Start with one small observation. The useful part is not the insight itself, but building the reflex to notice."
            />
          ) : (
            <div className="border-y border-brand-dark/12">
              {sortedSpots.map((spot, index) => (
                <article
                  key={`${spot.date}-${index}`}
                  className="grid gap-3 border-b border-brand-dark/12 py-5 last:border-b-0 md:grid-cols-[8rem_1fr]"
                >
                  <time className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
                    {new Date(spot.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                  <p className="font-sans text-sm leading-7 text-brand-dark">
                    {spot.description}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-12 text-white md:py-14">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[0.78fr_1.22fr] md:items-start">
          <div>
            <SectionLabel tone="dark">Related insights</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
              Read the patterns behind the moments.
            </h2>
          </div>
          <div className="grid gap-3">
            {relatedInsights.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between gap-4 rounded-lg border border-white/16 bg-white p-4 text-brand-dark transition hover:border-brand-teal"
              >
                <span className="inline-flex items-center gap-3 font-sans text-sm font-semibold">
                  <BookOpen className="h-4 w-4 text-brand-accent" />
                  {item.title}
                </span>
                <ArrowRight className="h-4 w-4 text-brand-accent transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-dark transition hover:text-brand-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to tools
        </Link>
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        context="start spotting your caveman"
      />
    </main>
  );
};

const LoadingBlock = ({ label }: { label: string }) => (
  <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm">
    <LoaderCircle className="h-6 w-6 animate-spin text-brand-accent" />
    <p className="mt-3 font-sans text-sm font-semibold text-brand-dark">
      {label}
    </p>
  </div>
);

const EmptyBlock = ({ title, text }: { title: string; text: string }) => (
  <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm">
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
      Empty state
    </p>
    <h2 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
      {title}
    </h2>
    <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">{text}</p>
  </div>
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

export default SpotsPage;
