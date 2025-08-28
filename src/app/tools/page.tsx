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

  const { token } = useAuth();

  // mock streak + microchallenge summary for now
  const streak = { current: 7, longest: 15 };
  const microSummary = {
    completed: 3,
    total: 5,
    current: "Hydrate Like a Caveman",
  };

  useEffect(() => {
    const fetchSpots = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/spots", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
  }, [token]);

  const spotCount = spots.length;

  let latestSpot: Spot | null = null;
  let firstSpot: Spot | null = null;

  if (spotCount > 0) {
    // sort by date (ascending)
    const sorted = [...spots].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    firstSpot = sorted[0];
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
          <h2 className="font-semibold text-lg text-[#042a2b] mb-2">Caveman Spotting</h2>

          {loading ? (
            <p className="text-sm text-brand-dark">Loading spots…</p>
          ) : !token ? (
            <div className="text-sm text-brand-dark">
              Please{" "}
              <button
                onClick={() => setShowAuth(true)}
                className="text-[#5eb1bf] font-semibold hover:underline"
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
                className="text-sm font-semibold text-[#042a2b] hover:text-[#5eb1bf] underline"
              >
                View All →
              </Link>
            </>
          )}
        </div>

        {/* Microchallenges summary */}
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="font-semibold text-lg text-[#042a2b] mb-2">Microchallenges</h2>
          <p className="text-sm text-brand-dark mb-2">
            {microSummary.completed}/{microSummary.total} challenges completed.
          </p>
          <p className="text-sm italic text-brand-dark mb-4">
            Current: “{microSummary.current}”
          </p>
          <Link
            href="/tools/microchallenges"
            className="text-sm font-semibold text-[#042a2b] hover:text-[#5eb1bf] underline"
          >
            Go to Challenges →
          </Link>
        </div>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default ToolsPage;
