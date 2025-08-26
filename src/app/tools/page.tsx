"use client";

import Link from "next/link";
import StreakBar from "../components/tools/StreakBar";
import NudgeOfTheDay from "../components/tools/NudgeOfTheDay";
import WeeklyReflections from "../components/tools/WeeklyReflections";

const ToolsPage = () => {
  const streak = { current: 7, longest: 15 };

  // mock data
  const spotCount = 12;
  const lastSpot = "Procrastinated tough task until late.";

  const microSummary = {
    completed: 3,
    total: 5,
    current: "Hydrate Like a Caveman",
  };

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
          <p className="text-sm text-gray-600 mb-2">
            You’ve logged <span className="font-bold">{spotCount}</span> spots so far.
          </p>
          {lastSpot && (
            <p className="text-sm italic text-gray-500 mb-4">
              Last: “{lastSpot}”
            </p>
          )}
          <Link
            href="/tools/spots"
            className="text-sm font-semibold text-[#042a2b] hover:text-[#5eb1bf] underline"
          >
            View All →
          </Link>
        </div>

        {/* Microchallenges summary */}
        <div className="p-4 border rounded-lg shadow-sm bg-white">
          <h2 className="font-semibold text-lg text-[#042a2b] mb-2">Microchallenges</h2>
          <p className="text-sm text-gray-600 mb-2">
            {microSummary.completed}/{microSummary.total} challenges completed.
          </p>
          <p className="text-sm italic text-gray-500 mb-4">
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
    </div>
  );
};

export default ToolsPage;
