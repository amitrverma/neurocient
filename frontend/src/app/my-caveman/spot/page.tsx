"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import MembershipModal from "@/app/components/MembershipModal";
import { questionsBank } from "@/app/diagnostics/caveman-scan/questionsBank";
import { buildScanPortrait } from "@/app/diagnostics/caveman-scan/scanPortrait";
import { loadLatestPortrait } from "@/app/diagnostics/caveman-scan/scanPersistence";
import {
  CAVEMAN_SCAN_STORAGE_KEY,
  type CavemanScanResponse,
} from "@/app/diagnostics/caveman-scan/scanStorage";

type SpotRecord = { id: string; description: string; pattern?: string | null };

export default function SpotMyCavemanPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [responses, setResponses] = useState<CavemanScanResponse[] | null>(null);
  const [patternSpotCount, setPatternSpotCount] = useState(0);
  const [spotCountReady, setSpotCountReady] = useState(false);
  const [moment, setMoment] = useState("");
  const [nextMove, setNextMove] = useState("");
  const [immediateEffect, setImmediateEffect] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMembership, setShowMembership] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/my-caveman");
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const local = window.localStorage.getItem(CAVEMAN_SCAN_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local) as { stage?: unknown; responses?: unknown };
          if (
            parsed.stage === "result" &&
            Array.isArray(parsed.responses) &&
            parsed.responses.length === questionsBank.length
          ) {
            if (!cancelled) setResponses(parsed.responses as CavemanScanResponse[]);
            return;
          }
        }
        const latest = await loadLatestPortrait();
        if (!cancelled) {
          if (latest?.length) setResponses(latest);
          else router.replace("/my-caveman");
        }
      } catch {
        if (!cancelled) router.replace("/my-caveman");
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [ready, router, user]);

  const portrait = useMemo(() => {
    if (!responses) return null;
    const evidence = responses.flatMap((response, index) => {
      const hydrated =
        response.evidence ??
        questionsBank[index]?.options.find((option) => option.label === response.label)?.evidence;
      return hydrated ? [hydrated] : [];
    });
    return buildScanPortrait(evidence);
  }, [responses]);

  useEffect(() => {
    if (!portrait) return;
    void fetch("/api/spots", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<SpotRecord[]>;
      })
      .then((spots) => {
        setPatternSpotCount(
          spots.filter((spot) => spot.pattern === portrait.primary.move).length,
        );
        setSpotCountReady(true);
      })
      .catch(() => {
        // A failed count should not prevent the user from recording a Spot.
        setSpotCountReady(true);
      });
  }, [portrait]);

  if (!ready || !user || !portrait || !spotCountReady) {
    return (
      <main className="journey-loading">
        <p>Opening the cue from your scan...</p>
      </main>
    );
  }

  const saveSpot = async () => {
    if (!moment.trim() || !nextMove.trim()) return;
    setSaving(true);
    setError(null);
    const marker = `[caveman-pattern:${portrait.primary.move}]`;
    const description = [
      marker,
      `Moment: ${moment.trim()}`,
      `What happened next: ${nextMove.trim()}`,
      immediateEffect.trim()
        ? `Immediate effect: ${immediateEffect.trim()}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const response = await fetch("/api/spots", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (
          response.status === 402 ||
          data?.detail?.code === "membership_required"
        ) {
          setShowMembership(true);
          return;
        }
        throw new Error(data?.detail?.message || "Could not keep this Spot.");
      }
      setPatternSpotCount((count) => count + 1);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not keep this Spot.");
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    const readyForExperiment = patternSpotCount >= 2;
    return (
      <main className="surface-page journey-dark-page flex min-h-[calc(100svh-4rem)] items-center px-6 py-14">
        <div className="mx-auto w-full max-w-3xl">
          <p className="page-eyebrow text-brand-secondary">
            You caught it
          </p>
          <h1 className="page-title mt-5 max-w-3xl text-white">
            You caught an automatic response while life was happening.
          </h1>
          <p className="mt-7 max-w-2xl font-sans text-base leading-8 text-white/72">
            That is enough for now. You recorded what happened before the
            details disappeared back into the day.
          </p>
          {readyForExperiment ? (
            <div className="mt-10 border-t border-white/16 pt-8">
              <p className="font-sans text-sm leading-7 text-white/68">
                You have now caught this response more than once. A tiny
                experiment can help you test whether another response is easier
                under different conditions.
              </p>
              <Link
                href={`/tools/microchallenges?from=spot&move=${portrait.primary.move}`}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-secondary px-6 py-3 font-sans text-sm font-semibold text-brand-dark"
              >
                Try one small experiment
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="mt-10 border-t border-white/16 pt-8">
              <p className="font-sans text-sm leading-7 text-white/68">
                Keep the same cue with you. Recording it again will tell you more
                than rushing straight into another solution.
              </p>
              <Link
                href="/my-caveman"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 font-sans text-sm font-semibold text-white"
              >
                Return to my portrait
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="surface-page caveman-scan-page min-h-[calc(100svh-4rem)] px-6 py-10 md:py-16">
      <div className="mx-auto max-w-3xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
          <Eye className="h-5 w-5" />
        </div>
        <p className="page-eyebrow mt-6 text-brand-primary">
          Record a real-life Spot
        </p>
        <h1 className="page-title mt-4 max-w-3xl">
          Bring one real moment into view.
        </h1>
        <div className="mt-8 border-l-4 border-brand-secondary pl-5">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
            Your cue
          </p>
          <p className="mt-3 text-xl font-bold leading-[1.4]">{portrait.primary.cue}</p>
        </div>

        <div className="mt-12 space-y-8 border-t border-brand-dark/12 pt-9">
          <Field
            label="What was happening?"
            value={moment}
            onChange={setMoment}
            placeholder="The document was open, but I had started clearing emails again…"
          />
          <Field
            label="What did you find yourself doing next?"
            value={nextMove}
            onChange={setNextMove}
            placeholder="I told myself I needed to get the smaller things out of the way first…"
          />
          {moment.trim() && nextMove.trim() && (
            <Field
              label="What changed immediately?"
              value={immediateEffect}
              onChange={setImmediateEffect}
              placeholder="Optional — perhaps relief, certainty, distance, reassurance, or simply less effort..."
            />
          )}
        </div>

        {error && <p className="mt-6 font-sans text-sm text-brand-accent">{error}</p>}
        <button
          type="button"
          disabled={!moment.trim() || !nextMove.trim() || saving}
          onClick={saveSpot}
          className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-dark px-6 py-3 font-sans text-sm font-semibold text-white disabled:pointer-events-none disabled:opacity-40"
        >
          {saving ? "Keeping this Spot…" : "Keep this Spot"}
          {!saving && <ArrowRight className="h-4 w-4" />}
        </button>
        <MembershipModal
          isOpen={showMembership}
          onClose={() => setShowMembership(false)}
        />
      </div>
    </main>
  );
}

const Field = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <label className="block">
    <span className="text-xl font-bold">{label}</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={3}
      className="mt-3 w-full resize-none border-x-0 border-b border-t-0 border-brand-dark/18 bg-transparent px-0 py-3 font-sans text-base leading-7 text-brand-dark outline-none placeholder:text-brand-dark/35 focus:border-brand-teal"
    />
  </label>
);
