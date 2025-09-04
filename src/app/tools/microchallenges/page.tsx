"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../../components/AuthModal";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Microchallenge {
  id: string;
  challenge_id: string;
  status: string;
  started_at: string;
  completed_at?: string | null;

  title: string;
  intro: string[];
  instructions: string[];
  why: string;
  tips: string[];
  closing: string;
}

const MicrochallengesPage = () => {
  const [challenges, setChallenges] = useState<Microchallenge[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // new state for inline carousel
  const [showNewChallenge, setShowNewChallenge] = useState(false);
  const [available, setAvailable] = useState<Microchallenge[]>([]);

  const { user, ready } = useAuth();

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
          credentials: "include", // 👈 send cookies
        });
        if (!res.ok) throw new Error("Failed to fetch challenges");
        const data = await res.json();
        setChallenges(data);
      } catch (err) {
        console.error("❌ Error fetching challenges:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [user, ready]);

  const toggleOpen = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const handleLog = async (challengeId: string) => {
    if (!ready) return;
    if (!user) {
      setShowAuth(true);
      return;
    }
    try {
      const res = await fetch(`/api/challenges/complete/${challengeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 👈 cookies handle auth
        body: JSON.stringify({ note }), // ✅ send note if present
      });
      if (!res.ok) throw new Error("Failed to mark complete");
      const updated = await res.json();
      setChallenges((prev) =>
        prev.map((c) =>
          c.challenge_id === challengeId ? { ...c, ...updated } : c
        )
      );
      setNote("");
    } catch (err) {
      console.error("❌ Error completing challenge:", err);
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
      console.error("❌ Error fetching all challenges:", err);
    }
  }
  setShowNewChallenge(!showNewChallenge);
};


  const handleStartChallenge = async (challenge: Microchallenge) => {
    try {
      const res = await fetch(`/api/challenges/assign/${challenge.id}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to start challenge");
      setShowNewChallenge(false);
      setChallenges((prev) => [...prev, { ...challenge, status: "assigned" }]);
    } catch (err) {
      console.error("❌ Error starting challenge:", err);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading microchallenges...</div>;
  }

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
          const isOpen = openId === c.id;
          return (
            <div key={c.id} className="border rounded-lg overflow-hidden">
              {/* Accordion header */}
              <button
                onClick={() => toggleOpen(c.id)}
                className="w-full flex justify-between items-center px-4 py-3 bg-white hover:bg-gray-50 transition"
              >
                <span className="text-sm font-medium text-[#042a2b]">
                  {c.title}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded ${
                      c.status === "completed"
                        ? "border text-green-700"
                        : c.status === "assigned"
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
                  {c.intro.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}

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

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Why it works:</h3>
                    <p>{c.why}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">Bonus tip:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {c.tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="pt-2 font-semibold">{c.closing}</p>

                  <div className="flex items-center gap-4 mt-4">
                    <button
                      onClick={() => handleLog(c.challenge_id)}
                      className="px-5 py-3 bg-brand-teal text-white font-semibold rounded-lg shadow-sm 
                                 hover:bg-brand-dark transition-colors focus:outline-none focus:ring-2 
                                 focus:ring-brand-teal focus:ring-offset-1"
                    >
                      ✓ I Did It Today
                    </button>

                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add notes (optional)..."
                      rows={1}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm 
                                focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-brand-teal 
                                resize-none text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Start a New Microchallenge */}
      <div className="mt-10">
        <div className="flex justify-center">
          <button
            onClick={handleToggleCarousel}
            className="px-6 py-3 border text-brand-dark font-semibold rounded-lg shadow-sm 
                       hover:bg-brand-primary transition-colors
                       hover:text-white"
          >
            {showNewChallenge ? "✕ Close" : "Start a New Microchallenge"}
          </button>
        </div>

        {showNewChallenge && (
          <div className="mt-6">
            {available.length === 0 ? (
              <p className=" text-center">
                No challenges available right now.
              </p>
            ) : (
              <div className="space-y-6">
  {available.map((c) => {
    const alreadyAssigned = challenges.some(
      (assigned) => assigned.challenge_id === c.id
    );

    return (
      <div
        key={c.id}
        className="border rounded-lg p-6  shadow-sm flex flex-col"
      >
        <h3 className="text-lg font-semibold text-brand-dark">{c.title}</h3>

        <div className="mt-2 space-y-2 text-md">
          {c.intro.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>

        {/* Action aligned bottom-right */}
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
    </div>
  );
};

export default MicrochallengesPage;