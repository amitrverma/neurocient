"use client";
import React, { useState } from "react";
import CavemanSpot from "../ui/CavemanSpot";

const CavemanSpotting = ({
  spots,
  onAuthRequired,
}: {
  spots: { date: string; description: string }[];
  onAuthRequired?: () => void;
}) => {
  const [allSpots, setAllSpots] = useState(spots);

  // ✅ Reverse chronological sort
  const sortedSpots = [...allSpots].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold text-[#042a2b] mb-4">Caveman Spotting</h3>

      {/* ✅ Inline Add Spot form (reusing CavemanSpot in inline mode) */}
      <CavemanSpot
        prompt="What’s one caveman instinct you spotted just now?"
        mode="inline"
        onAuthRequired={onAuthRequired}
        onAdded={(spot) => setAllSpots((prev) => [spot, ...prev])}
      />

      {/* ✅ Spot list */}
      <ul className="divide-y divide-red-500 max-h-64 overflow-y-auto pr-2">
        {sortedSpots.map((s, i) => (
          <li key={i} className="py-3">
            <div className="text-xs text-gray-500 mb-1">
              {new Date(s.date).toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <p className="text-[#042a2b] text-sm">{s.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CavemanSpotting;
