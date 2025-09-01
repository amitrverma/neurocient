"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import StreakBar from "../components/tools/StreakBar";
import AuthModal from "../components/AuthModal";

interface Spot {
  date: string;
  description: string;
}

const ToolsPage = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const { user } = useAuth();

  // mock streak + microchallenge summary for now
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
        const res = await fetch("/api/spots", {
          method: "GET",
          credentials: "include", // ✅ rely on cookies
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
  }, [user]); // ✅ depend on user, not token

  const spotCount = spots.length;

  let latestSpot: Spot | null = null;

  if (spotCount > 0) {
    const sorted = [...spots].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    latestSpot = sorted[sorted.length - 1];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-[#042a2b] mb-4">🛠 Tools Dashboard</h1>

      {/* 1. Streak */}
      <StreakBar current={streak.current} longest={streak.longest} />

      {/* 2. Grid of summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Caveman Spotting summary */}
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="font-semibold text-lg text-[#042a2b] mb-2">
            Spot Your Inner Caveman
          </h2>

          {spotCount < 5 ? (
            <p className="text-md text-brand-dark mb-4">
              {/* long explanatory version */}
              Your brain runs on ancient wiring...
            </p>
          ) : (
            <p className="text-md text-brand-dark mb-4">
              {/* short version */}
              Spotting your caveman means noticing the moments when instincts
              show up in modern life...
            </p>
          )}

          {loading ? (
            <p className="text-sm text-brand-dark">Loading spots…</p>
          ) : !user ? (
            <div className="text-sm text-brand-dark">
              Please{" "}
              <button
                onClick={() => setShowAuth(true)}
                className="text-brand-accent font-bold text-md hover:underline cursor-pointer"
              >
                log in
              </button>{" "}
              to see your Caveman Spots.
            </div>
          ) : (
            <>
              <p className="text-sm text-brand-dark mb-2">
                You’ve logged <span className="font-bold">{spotCount}</span>{" "}
                {spotCount === 1 ? "spot" : "spots"} so far.
              </p>
              {latestSpot && (
                <p className="text-sm italic text-brand-dark mb-4">
                  Latest: “{latestSpot.description}”
                </p>
              )}

              <Link
                href="/tools/spots"
                className="inline-block border text-brand-dark font-semibold px-6 py-3 rounded-xl shadow hover:bg-brand-teal hover:text-white transition"
              >
                View All
              </Link>
            </>
          )}
        </div>

        {/* Microchallenges summary */}
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="font-semibold text-lg text-[#042a2b] mb-2">
            Microchallenges
          </h2>
          {!user ? (
            <>
              {/* logged out version */}
              <p className="text-md text-brand-dark mb-4">
                Microchallenges are tiny, science-backed experiments...
              </p>
              <div className="text-sm text-brand-dark">
                Please{" "}
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-brand-accent font-bold text-md hover:underline cursor-pointer"
                >
                  log in
                </button>{" "}
                to see your Microchallenges.
              </div>
            </>
          ) : (
            <>
              {/* logged in version */}
              {microSummary.completed < 1 ? (
                <p className="text-md text-brand-dark mb-4">
                  Microchallenges are tiny, science-backed experiments...
                </p>
              ) : (
                <p className="text-md text-brand-dark mb-4">
                  Microchallenges are small nudges that build awareness...
                </p>
              )}
              <p className="text-sm text-brand-dark mb-2">
                {microSummary.completed}/{microSummary.total} challenges
                completed.
              </p>
              {microSummary.current && (
                <p className="text-sm italic text-brand-dark mb-4">
                  Current: “{microSummary.current}”
                </p>
              )}
              <Link
                href="/tools/microchallenges"
                className="inline-block border text-brand-dark font-semibold px-6 py-3 rounded-xl shadow hover:bg-brand-teal hover:text-white transition"
              >
                Go to Challenges
              </Link>
            </>
          )}
        </div>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default ToolsPage;
