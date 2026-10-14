"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../../components/AuthModal";
import { useNotification } from "../../components/NotificationProvider";
import ConfettiCelebration from "../../components/ui/ConfettiCelebration";
import type { ProtectiveMove } from "@/app/diagnostics/caveman-scan/scanEvidence";

interface AssignedChallenge {
  assignment_id: string;
  challenge_id: string;
  status: "active" | "success" | "completed" | "removed" | "failed";
  started_at: string;
  completed_at?: string | null;
  title: string;
  intro: string[];
  instructions: string[];
  why: string;
  tips: string[];
  closing: string;
  progress: number;
  logged_today?: boolean;
  loggedToday?: boolean;
}

interface AvailableChallenge {
  id: string;
  title: string;
  intro: string[];
}

const patternKeywords: Record<ProtectiveMove, string[]> = {
  seek_relief: ["attention", "distraction", "phone", "scroll", "urge", "start"],
  restore_control: ["plan", "perfect", "uncertain", "next step", "begin", "start"],
  social_monitoring: ["compare", "social", "reassurance", "attention", "judgment"],
  create_distance: ["connect", "conversation", "message", "reach out", "relationship"],
  override_signal: ["rest", "energy", "body", "exercise", "pause"],
  discharge_pressure: ["pressure", "stress", "pause", "reaction", "breath"],
  self_verdict: ["self", "restart", "return", "imperfect", "kind"],
  flexible_response: ["notice", "pause", "choice", "moment"],
};

const rankChallenges = (
  challenges: AvailableChallenge[],
  pattern: ProtectiveMove | null,
) => {
  if (!pattern || !patternKeywords[pattern]) return challenges;
  const keywords = patternKeywords[pattern];
  return challenges
    .map((challenge, index) => {
      const content = `${challenge.title} ${(challenge.intro ?? []).join(" ")}`.toLowerCase();
      const score = keywords.reduce(
        (total, keyword) => total + (content.includes(keyword) ? 1 : 0),
        0,
      );
      return { challenge, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ challenge }) => challenge);
};

const MicrochallengesPage = () => {
  const [challenges, setChallenges] = useState<AssignedChallenge[]>([]);
  const [available, setAvailable] = useState<AvailableChallenge[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [guidedEntry, setGuidedEntry] = useState(false);
  const [guidedPattern, setGuidedPattern] = useState<ProtectiveMove | null>(null);

  const { user, ready } = useAuth();
  const { notify } = useNotification();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setGuidedEntry(params.get("from") === "spot");
    const pattern = params.get("move") as ProtectiveMove | null;
    setGuidedPattern(pattern);
  }, []);

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!ready) return;
      if (!user) {
        setChallenges([]);
        setLoadFailed(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadFailed(false);
      try {
        const res = await fetch("/api/challenges/my", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch challenges");

        const data = await res.json();
        setChallenges(
          data.map((challenge: AssignedChallenge) => ({
            ...challenge,
            loggedToday: Boolean(challenge.logged_today),
          })),
        );
      } catch (err) {
        console.error("Error fetching challenges:", err);
        setLoadFailed(true);
        notify("Failed to load challenges.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user, ready, notify, reloadKey]);

  useEffect(() => {
    if (!guidedEntry || !ready || !user) return;
    void fetch("/api/challenges/all", {
      method: "GET",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<AvailableChallenge[]>;
      })
      .then((data) => {
        setAvailable(rankChallenges(data, guidedPattern));
        setShowNewChallenge(true);
      })
      .catch(() => notify("Failed to load available experiments.", "error"));
  }, [guidedEntry, guidedPattern, notify, ready, user]);

  const activeChallenge = challenges.find((c) => c.status === "active");
  const completedCount = challenges.filter(
    (c) => c.status === "success" || c.status === "completed",
  ).length;

  const toggleOpen = (assignmentId: string) => {
    setOpenId(openId === assignmentId ? null : assignmentId);
  };

  const handleLog = async (assignment: AssignedChallenge) => {
    try {
      const res = await fetch("/api/challenges/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ assignment_id: assignment.assignment_id, note }),
      });

      if (!res.ok) {
        const errData = await res.json();
        notify(errData.detail || "Failed to log progress", "error");
        return;
      }

      const data = await res.json();
      if (data.status === "success") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }

      setChallenges((prev) =>
        prev.map((challenge) =>
          challenge.assignment_id === assignment.assignment_id
            ? {
                ...challenge,
                progress: Math.round(data.progress),
                loggedToday: true,
                status: data.status,
                completed_at: data.completed_at || challenge.completed_at,
              }
            : challenge,
        ),
      );
      notify("Logged successfully.", "success");
      setNote("");
    } catch (err) {
      console.error("Error logging challenge:", err);
      notify("Something went wrong while logging.", "error");
    }
  };

  const handleToggleCarousel = async () => {
    if (!showNewChallenge) {
      try {
        const res = await fetch("/api/challenges/all", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch all challenges");
        const data = await res.json();
        setAvailable(data);
      } catch (err) {
        console.error("Error fetching all challenges:", err);
        notify("Failed to load available challenges.", "error");
      }
    }
    setShowNewChallenge(!showNewChallenge);
  };

  const handleStartChallenge = async (challenge: AvailableChallenge) => {
    try {
      const res = await fetch(`/api/challenges/assign/${challenge.id}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        if (errData.detail === "You already have an active challenge") {
          notify(
            "You already have an active challenge. Finish or remove it first.",
            "info",
          );
          return;
        }
        notify(errData.detail || "Failed to start challenge", "error");
        return;
      }

      const newAssignment = await res.json();
      setShowNewChallenge(false);

      setChallenges((prev) => [
        ...prev,
        {
          assignment_id: newAssignment.assignment_id ?? newAssignment.id,
          challenge_id: challenge.id,
          status: newAssignment.status,
          started_at: newAssignment.started_at,
          completed_at: newAssignment.completed_at,
          title: challenge.title,
          intro: challenge.intro,
          instructions: [],
          why: "",
          tips: [],
          closing: "",
          progress: 0,
          loggedToday: false,
        },
      ]);

      notify(guidedEntry ? "Experiment started." : "Challenge started successfully.", "success");
    } catch (err) {
      console.error("Error starting challenge:", err);
      notify("Something went wrong while starting the challenge.", "error");
    }
  };

  const handleRemove = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/challenges/remove/${assignmentId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove challenge");

      setChallenges((prev) =>
        prev.map((challenge) =>
          challenge.assignment_id === assignmentId
            ? {
                ...challenge,
                status: "removed",
                completed_at: new Date().toISOString(),
              }
            : challenge,
        ),
      );
      notify("Challenge removed successfully.", "success");
    } catch (err) {
      console.error("Error removing challenge:", err);
      notify("Something went wrong while removing the challenge.", "error");
    }
  };

  return (
    <main className="surface-page tool-detail-page">
      <section className="tool-detail-hero">
        <div>
          <SectionLabel>Small experiment</SectionLabel>
          <h1 className="tool-detail-title">
            Change one condition.
            <span>See what changes.</span>
          </h1>
          <p className="tool-detail-lede">
            {guidedEntry
              ? "You have recorded the response in real life. Now choose one small experiment that fits the pattern and changes one part of the situation."
              : "Microchallenges are small behavior experiments. Change a cue, environment, or first action, then use repetition to learn what helps in real conditions."}
          </p>
        </div>

        {!guidedEntry && (
          <aside className="tool-detail-summary grid gap-4 sm:grid-cols-3">
            <Metric label="Active" value={loadFailed || !user ? "—" : activeChallenge ? "1" : "0"} />
            <Metric label="Completed" value={loadFailed || !user ? "—" : String(completedCount)} />
            <Metric label="Assigned" value={loading ? "..." : loadFailed || !user ? "—" : String(challenges.length)} />
          </aside>
        )}
      </section>

      <section className="tool-detail-content">
        {loading ? (
          <LoadingBlock />
        ) : loadFailed ? (
          <LoadErrorBlock onRetry={() => setReloadKey((value) => value + 1)} />
        ) : !user ? (
          <SignedOutBlock onLogin={() => setShowAuth(true)} />
        ) : challenges.length === 0 && !guidedEntry ? (
          <EmptyBlock onStart={handleToggleCarousel} />
        ) : challenges.length === 0 ? (
          <div className="max-w-2xl border-l-4 border-brand-secondary pl-5">
            <h2 className="text-2xl font-bold leading-tight text-brand-dark">
              Choose the experiment that feels closest to the moments you spotted.
            </h2>
            <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/70">
              Keep it small. This is not a new routine or a test of discipline;
              it is one way to learn what changes when you interrupt the usual move.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
            <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                Next action
              </p>
              {activeChallenge ? (
                <>
                  <h2 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
                    Keep going with {activeChallenge.title}
                  </h2>
                  <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
                    Log one repetition today. Repeated observations show
                    whether the changed condition helps in real situations.
                  </p>
                  <button
                    onClick={() => toggleOpen(activeChallenge.assignment_id)}
                    className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Open active challenge
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <h2 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
                    Choose your next experiment.
                  </h2>
                  <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
                    Pick one challenge that feels useful and small enough to
                    repeat.
                  </p>
                </>
              )}
              <button
                onClick={handleToggleCarousel}
                disabled={Boolean(activeChallenge)}
                className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary disabled:pointer-events-none disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                {showNewChallenge ? "Close choices" : "Start a new challenge"}
              </button>
            </div>

            <div>
              <div className="mb-5 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                <span>Your challenges</span>
                <span className="h-px flex-1 bg-brand-dark/15" />
              </div>
              <div className="border-y border-brand-dark/12">
                {challenges.map((challenge) => (
                  <ChallengeRow
                    key={challenge.assignment_id}
                    challenge={challenge}
                    isOpen={openId === challenge.assignment_id}
                    note={note}
                    onNoteChange={setNote}
                    onToggle={() => toggleOpen(challenge.assignment_id)}
                    onLog={() => handleLog(challenge)}
                    onRemove={() => handleRemove(challenge.assignment_id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {showNewChallenge && !activeChallenge && user && (
          <AvailableChallenges
            available={guidedEntry ? available.slice(0, 3) : available}
            challenges={challenges}
            onStart={handleStartChallenge}
            guided={guidedEntry}
          />
        )}
      </section>

      <div className="tool-detail-return">
        <Link
          href={guidedEntry ? "/my-caveman" : "/tools"}
          className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-dark transition hover:text-brand-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {guidedEntry ? "Back to my portrait" : "Back to tools"}
        </Link>
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        context="start microchallenges"
      />
      <ConfettiCelebration trigger={showConfetti} />
    </main>
  );
};

const ChallengeRow = ({
  challenge,
  isOpen,
  note,
  onNoteChange,
  onToggle,
  onLog,
  onRemove,
}: {
  challenge: AssignedChallenge;
  isOpen: boolean;
  note: string;
  onNoteChange: (value: string) => void;
  onToggle: () => void;
  onLog: () => void;
  onRemove: () => void;
}) => {
  const progress = Math.min(100, Math.round(challenge.progress || 0));

  return (
    <article className="border-b border-brand-dark/12 last:border-b-0">
      <button
        onClick={onToggle}
        className="grid w-full cursor-pointer gap-4 py-5 text-left transition hover:text-brand-primary md:grid-cols-[1fr_auto] md:items-center"
      >
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
            {challenge.status}
          </p>
          <h2 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
            {challenge.title}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-sm font-semibold text-brand-dark">
            {progress}%
          </span>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-brand-accent" />
          ) : (
            <ChevronDown className="h-5 w-5 text-brand-accent" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="pb-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-brand-dark/10">
            <div
              className="h-full rounded-full bg-brand-teal transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-5 space-y-4 font-sans text-sm leading-7 text-brand-dark/72">
            {challenge.intro?.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {challenge.instructions?.length > 0 && (
            <Block title="The microchallenge">
              <ol className="list-decimal space-y-2 pl-5 font-sans text-sm leading-7 text-brand-dark/72">
                {challenge.instructions.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </Block>
          )}

          {challenge.why && (
            <Block title="Why it works">
              <p>{challenge.why}</p>
            </Block>
          )}

          {challenge.tips?.length > 0 && (
            <Block title="Bonus tip">
              <ul className="list-disc space-y-2 pl-5">
                {challenge.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </Block>
          )}

          {challenge.status === "active" && (
            <div className="mt-6 grid gap-3 md:grid-cols-[auto_1fr] md:items-center">
              <button
                onClick={onLog}
                disabled={challenge.loggedToday}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-40"
              >
                <CheckCircle2 className="h-4 w-4" />
                {challenge.loggedToday ? "Logged today" : "Log today"}
              </button>
              <textarea
                value={note}
                onChange={(event) => onNoteChange(event.target.value)}
                placeholder="Quick reflection, optional"
                rows={1}
                className="min-h-11 resize-none rounded-lg border border-brand-dark/15 px-4 py-3 font-sans text-sm text-brand-dark outline-none transition focus:border-brand-teal"
              />
            </div>
          )}

          {(challenge.status === "success" || challenge.status === "completed") &&
            challenge.title.toLowerCase().includes("procrast") && (
            <div className="mt-6 border-l-4 border-brand-secondary pl-4">
              <p className="font-sans text-sm leading-7 text-brand-dark/72">
                You have repeated the experiment enough to have real-life
                evidence. Practice can now help you work with the fuller loop
                behind it—without turning this into another habit to perform.
              </p>
              <Link
                href="/practice"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white"
              >
                Continue into Practice
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {challenge.status === "active" && (
            <button
              onClick={onRemove}
              className="mt-5 inline-flex cursor-pointer items-center gap-2 font-sans text-sm font-semibold text-brand-accent transition hover:text-brand-primary"
            >
              <Trash2 className="h-4 w-4" />
              Remove challenge
            </button>
          )}
        </div>
      )}
    </article>
  );
};

const AvailableChallenges = ({
  available,
  challenges,
  onStart,
  guided = false,
}: {
  available: AvailableChallenge[];
  challenges: AssignedChallenge[];
  onStart: (challenge: AvailableChallenge) => void;
  guided?: boolean;
}) => (
  <section className="mt-10">
    <SectionLabel>{guided ? "One small experiment" : "Choose a challenge"}</SectionLabel>
    {available.length === 0 ? (
      <EmptyPanel text="No challenges available right now." />
    ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {available.map((challenge) => {
          const alreadyAssigned = challenges.some(
            (assigned) =>
              assigned.challenge_id === challenge.id &&
              assigned.status !== "removed",
          );

          return (
            <article
              key={challenge.id}
              className="rounded-lg border border-brand-dark/12 bg-white p-5 shadow-sm"
            >
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                {guided ? "Small experiment" : "Microchallenge"}
              </p>
              <h3 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
                {challenge.title}
              </h3>
              <div className="mt-3 space-y-2 font-sans text-sm leading-7 text-brand-dark/72">
                {challenge.intro?.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
              {alreadyAssigned ? (
                <span className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-dark/55">
                  <CheckCircle2 className="h-4 w-4" />
                  Already assigned
                </span>
              ) : (
                <button
                  onClick={() => onStart(challenge)}
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {guided ? "Try this experiment" : "Start this challenge"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </article>
          );
        })}
      </div>
    )}
  </section>
);

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-brand-dark/12 bg-white p-5 shadow-sm">
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
      {label}
    </p>
    <p className="mt-3 font-sans text-4xl font-semibold tracking-[-0.03em] text-brand-dark">
      {value}
    </p>
  </div>
);

const LoadingBlock = () => (
  <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm">
    <LoaderCircle className="h-6 w-6 animate-spin text-brand-accent" />
    <p className="mt-3 font-sans text-sm font-semibold text-brand-dark">
      Loading microchallenges...
    </p>
  </div>
);

const LoadErrorBlock = ({ onRetry }: { onRetry: () => void }) => (
  <div className="border border-brand-dark/12 bg-white p-6">
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
      Account data unavailable
    </p>
    <h2 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
      Your challenges could not be loaded.
    </h2>
    <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
      Nothing has been counted as empty or reset. Try again when the connection is available.
    </p>
    <button onClick={onRetry} className="surface-action">
      Try again
      <ArrowRight aria-hidden="true" />
    </button>
  </div>
);

const SignedOutBlock = ({ onLogin }: { onLogin: () => void }) => (
  <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm">
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
      Sign in required
    </p>
    <h2 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
      Log in to start your microchallenges.
    </h2>
    <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
      Microchallenges are small behavior experiments. Sign in to choose one,
      track progress, and keep your practice history connected to your account.
    </p>
    <button
      onClick={onLogin}
      className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90"
    >
      Log in
      <ArrowRight className="h-4 w-4" />
    </button>
  </div>
);

const EmptyBlock = ({ onStart }: { onStart: () => void }) => (
  <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm">
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
      Empty state
    </p>
    <h2 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
      No microchallenges assigned yet.
    </h2>
    <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
      Start with one small experiment. The point is not intensity; it is
      repetition.
    </p>
    <button
      onClick={onStart}
      className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90"
    >
      Choose a challenge
      <ArrowRight className="h-4 w-4" />
    </button>
  </div>
);

const EmptyPanel = ({ text }: { text: string }) => (
  <div className="rounded-lg border border-brand-dark/12 bg-white p-6 font-sans text-sm text-brand-dark/72 shadow-sm">
    {text}
  </div>
);

const Block = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="mt-5 border-l-4 border-brand-secondary pl-4 font-sans text-sm leading-7 text-brand-dark/72">
    <h3 className="mb-2 text-sm font-semibold text-brand-dark">{title}</h3>
    {children}
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
    className={`page-eyebrow mb-7 flex items-center gap-3 ${
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

export default MicrochallengesPage;
