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

interface AssignedChallenge {
  assignment_id: string;
  challenge_id: string;
  status: "active" | "success" | "removed" | "failed";
  started_at: string;
  completed_at?: string | null;
  title: string;
  intro: string[];
  instructions: string[];
  why: string;
  tips: string[];
  closing: string;
  progress: number;
  loggedToday?: boolean;
}

interface AvailableChallenge {
  id: string;
  title: string;
  intro: string[];
}

const MicrochallengesPage = () => {
  const [challenges, setChallenges] = useState<AssignedChallenge[]>([]);
  const [available, setAvailable] = useState<AvailableChallenge[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const { user, ready } = useAuth();
  const { notify } = useNotification();

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!ready) return;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/challenges/my", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch challenges");

        const data = await res.json();
        const todayKey = new Date().toISOString().slice(0, 10);
        const stored = localStorage.getItem("loggedToday");

        setChallenges(
          data.map((challenge: AssignedChallenge) => ({
            ...challenge,
            loggedToday: stored === todayKey,
          })),
        );
      } catch (err) {
        console.error("Error fetching challenges:", err);
        notify("Failed to load challenges.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user, ready, notify]);

  const activeChallenge = challenges.find((c) => c.status === "active");
  const completedCount = challenges.filter((c) => c.status === "success").length;

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
      const todayKey = new Date().toISOString().slice(0, 10);
      localStorage.setItem("loggedToday", todayKey);

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
          assignment_id: newAssignment.id,
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

      notify("Challenge started successfully.", "success");
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
    <main className="bg-white font-serif text-brand-dark">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-6 pt-12 md:grid-cols-[0.78fr_1.22fr] md:items-start md:pb-8 md:pt-16">
        <div>
          <SectionLabel>Daily experiment</SectionLabel>
          <h1 className="text-[clamp(2.6rem,5vw,5.1rem)] font-bold leading-[0.98] tracking-[-0.03em] text-brand-dark">
            Small actions.
            <br />
            <span className="italic text-brand-accent">Repeated enough.</span>
          </h1>
          <p className="mt-6 max-w-xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark">
            Microchallenges are tiny behavior experiments. They lower the
            threat of change so your nervous system gets evidence through
            repetition.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Active" value={activeChallenge ? "1" : "0"} />
          <Metric label="Completed" value={String(completedCount)} />
          <Metric label="Total" value={loading ? "..." : String(challenges.length)} />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-14 md:pb-16">
        {loading ? (
          <LoadingBlock />
        ) : !user ? (
          <SignedOutBlock onLogin={() => setShowAuth(true)} />
        ) : challenges.length === 0 ? (
          <EmptyBlock onStart={handleToggleCarousel} />
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
                    Log one small repetition today. Consistency teaches the
                    system faster than intensity.
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
            available={available}
            challenges={challenges}
            onStart={handleStartChallenge}
          />
        )}
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
}: {
  available: AvailableChallenge[];
  challenges: AssignedChallenge[];
  onStart: (challenge: AvailableChallenge) => void;
}) => (
  <section className="mt-10">
    <SectionLabel>Choose a challenge</SectionLabel>
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
                Microchallenge
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
                  Start this challenge
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

export default MicrochallengesPage;
