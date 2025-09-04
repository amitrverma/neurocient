"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../../components/AuthModal";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useNotification } from "../../components/NotificationProvider";
import ConfettiCelebration from "../../components/ui/ConfettiCelebration";


// 🔹 Assigned challenges (from /challenges/my)
interface AssignedChallenge {
  assignment_id: string;  // UserMicrochallenge.id
  challenge_id: string;   // MicrochallengeDefinition.id
  status: "active" | "success" | "removed" | "failed";
  started_at: string;
  completed_at?: string | null;

  title: string;
  intro: string[];
  instructions: string[];
  why: string;
  tips: string[];
  closing: string;

  progress: number;       // % complete (rounded)
  loggedToday?: boolean;  // frontend-only flag
}

// 🔹 Available challenges (from /challenges/all)
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

  // 🔹 Fetch my assigned challenges
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!ready) return;
      if (!user) {
        setLoading(false);
        setShowAuth(true);
        return;
      }
      try {
        const res = await fetch("/api/challenges/my", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch challenges");
        const data = await res.json();

        // ✅ restore loggedToday from localStorage
        const todayKey = new Date().toISOString().slice(0, 10);
        const stored = localStorage.getItem("loggedToday");

        setChallenges(
          data.map((c: AssignedChallenge) => ({
            ...c,
            loggedToday: stored === todayKey,
          }))
        );
      } catch (err) {
        console.error("❌ Error fetching challenges:", err);
        notify("Failed to load challenges.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user, ready, notify]);

  const toggleOpen = (assignmentId: string) => {
    setOpenId(openId === assignmentId ? null : assignmentId);
  };

  // 🔹 Log today’s progress
  const handleLog = async (assignment: AssignedChallenge) => {
    try {
      const res = await fetch(`/api/challenges/log`, {
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

      // ✅ save today’s date in localStorage
      const todayKey = new Date().toISOString().slice(0, 10);
      localStorage.setItem("loggedToday", todayKey);

        if (data.status === "success") {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000); // stop after 5s
        }
      // ✅ update state
      setChallenges((prev) =>
      prev.map((c) =>
        c.assignment_id === assignment.assignment_id
          ? { 
              ...c, 
              progress: Math.round(data.progress), 
              loggedToday: true,
              status: data.status, // ✅ update status
              completed_at: data.completed_at || c.completed_at
            }
          : c
      )
    );
      notify("✅ Logged successfully!", "success");
      setNote("");
    } catch (err) {
      console.error("❌ Error logging challenge:", err);
      notify("Something went wrong while logging.", "error");
    }
  };

  // 🔹 Fetch available challenges
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
        console.error("❌ Error fetching all challenges:", err);
        notify("Failed to load available challenges.", "error");
      }
    }
    setShowNewChallenge(!showNewChallenge);
  };

  // 🔹 Assign new challenge
  const handleStartChallenge = async (challenge: AvailableChallenge) => {
    try {
      const res = await fetch(`/api/challenges/assign/${challenge.id}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        if (errData.detail === "You already have an active challenge") {
          notify("⚡ You already have an active challenge. Finish or remove it first.", "info");
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

      notify("🎉 Challenge started successfully!", "success");
    } catch (err) {
      console.error("❌ Error starting challenge:", err);
      notify("Something went wrong while starting the challenge.", "error");
    }
  };

  // 🔹 Remove challenge
  const handleRemove = async (assignmentId: string) => {
    try {
      const res = await fetch(`/api/challenges/remove/${assignmentId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove challenge");

      setChallenges((prev) =>
        prev.map((c) =>
          c.assignment_id === assignmentId
            ? { ...c, status: "removed", completed_at: new Date().toISOString() }
            : c
        )
      );
      notify("🗑️ Challenge removed successfully.", "success");
    } catch (err) {
      console.error("❌ Error removing challenge:", err);
      notify("Something went wrong while removing the challenge.", "error");
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading microchallenges...</div>;
  }

  const activeChallenge = challenges.find((c) => c.status === "active");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#042a2b] mb-6">⚡ Microchallenges</h1>

      <p className="text-brand-dark mb-6">
        Track your weekly microchallenges here. Complete them to build
        consistency and strengthen new habits.
      </p>

      {challenges.length === 0 && (
        <p className="text-brand-dark">No microchallenges assigned yet.</p>
      )}

      <div className="space-y-4">
        {challenges.map((c) => {
          const isOpen = openId === c.assignment_id;
          return (
            <div key={c.assignment_id} className="border rounded-lg overflow-hidden">
              {/* Accordion header */}
              <button
                onClick={() => toggleOpen(c.assignment_id)}
                className="w-full flex justify-between items-center px-4 py-3 bg-white hover:bg-gray-50 transition"
              >
                <span className="text-sm font-medium text-[#042a2b]">
                  {c.title}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      c.status === "success"
                        ? "border text-green-700"
                        : c.status === "active"
                        ? "border text-blue-700"
                        : "border text-brand-dark"
                    }`}
                  >
                    {c.status}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-brand-dark" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-brand-dark" />
                  )}
                </div>
              </button>

              {/* Accordion content */}
              {isOpen && (
                <div className="border-t border-[#5eb1bf] p-6 text-[#042a2b] space-y-6">
                  {c.intro?.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}

                  {c.instructions?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">
                        The Microchallenge:
                      </h3>
                      <ol className="list-decimal list-inside space-y-1">
                        {c.instructions.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {c.why && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Why it works:</h3>
                      <p>{c.why}</p>
                    </div>
                  )}

                  {c.tips?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Bonus tip:</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {c.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {c.closing && <p className="pt-2 font-semibold">{c.closing}</p>}

                  <div className="flex flex-col gap-4 mt-4">
  {/* Progress bar with % */}
  {typeof c.progress === "number" && (
    <div className="flex items-center gap-3">
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="bg-brand-teal h-3 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.round(c.progress))}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-brand-dark min-w-[3ch]">
        {Math.min(100, Math.round(c.progress))}%
      </span>
    </div>
  )}

  {c.status === "active" && (
    <div className="flex items-center gap-4">
      {/* Checkbox for daily log */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={c.loggedToday}
          onChange={() => handleLog(c)}
          disabled={c.loggedToday}
          className="h-5 w-5 accent-brand-teal rounded-md cursor-pointer disabled:opacity-60"
        />
        <span
          className={`font-semibold ${
            c.loggedToday ? "text-gray-500 line-through" : "text-brand-dark"
          }`}
        >
          {c.loggedToday ? "Yes, done!" : "I Did It Today"}
        </span>
      </label>

      {/* Notes */}
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Write a quick reflection (optional)..."
        rows={1}
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal 
                   resize-none text-sm"
      />
    </div>
  )}
</div>


                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Start a New Microchallenge */}
      <div className="mt-10">
        {activeChallenge ? (
          <div className="text-center text-sm text-gray-700 space-y-2">
            <p>
              ⚡ You’re already working on{" "}
              <strong>{activeChallenge.title}</strong>.
            </p>
            <p>
              Keep logging daily to complete it, or{" "}
              <button
                onClick={() => handleRemove(activeChallenge.assignment_id)}
                className="text-red-600 underline hover:text-red-800"
              >
                remove it
              </button>{" "}
              if you want to start a different one.
            </p>
          </div>
        ) : (
          <button
            onClick={handleToggleCarousel}
            className="px-6 py-3 border text-brand-dark font-semibold rounded-lg shadow-sm 
                       hover:bg-brand-primary transition-colors hover:text-white"
          >
            {showNewChallenge ? "✕ Close" : "Start a New Microchallenge"}
          </button>
        )}

        {showNewChallenge && !activeChallenge && (
          <div className="mt-6">
            {available.length === 0 ? (
              <p className=" text-center">No challenges available right now.</p>
            ) : (
              <div className="space-y-6">
                {available.map((c) => {
                  const alreadyAssigned = challenges.some(
  (assigned) =>
    assigned.challenge_id === c.id &&
    assigned.status !== "removed" // ✅ ignore removed ones
);

                  return (
                    <div
                      key={c.id}
                      className="border rounded-lg p-6 shadow-sm flex flex-col"
                    >
                      <h3 className="text-lg font-semibold text-brand-dark">
                        {c.title}
                      </h3>

                      <div className="mt-2 space-y-2 text-md">
                        {c.intro?.map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>

                      <div className="mt-auto self-end">
                        {alreadyAssigned ? (
                          <span className="inline-block px-3 py-2 text-xs font-semibold text-gray-600 border rounded">
                            ✅ Already Assigned
                          </span>
                        ) : (
                          <button
                            onClick={() => handleStartChallenge(c)}
                            className="px-4 py-2 bg-brand-teal text-white rounded-lg shadow-sm 
                                       hover:bg-brand-dark transition"
                          >
                            Start This Challenge
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/tools"
          className="text-sm font-semibold text-[#042a2b] hover:text-[#5eb1bf] underline"
        >
          ← Back to Tools Dashboard
        </Link>
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        context="start microchallenges"
      />
      <ConfettiCelebration trigger={showConfetti} />
    </div>
  );
};

export default MicrochallengesPage;
