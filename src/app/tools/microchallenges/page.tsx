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

  const { user } = useAuth();

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!user) {
        setLoading(false);
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
  }, [user]); // ✅ depend on user

  const toggleOpen = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const handleLog = async (challengeId: string) => {
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

                  <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <button
                      className="bg-[#5eb1bf] hover:bg-[#4aa2af] text-white font-semibold px-6 py-2 rounded-lg"
                      onClick={() => handleLog(c.challenge_id)}
                    >
                      ✔ I Did It Today
                    </button>
                    <textarea
                      className="border rounded-md p-2 w-full md:w-60"
                      placeholder="Add notes (optional)..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <Link
          href="/tools"
          className="text-sm font-semibold text-[#042a2b] hover:text-[#5eb1bf] underline"
        >
          ← Back to Tools Dashboard
        </Link>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default MicrochallengesPage;
