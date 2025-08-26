"use client";
import { useState } from "react";

interface MicroChallengeProps {
  challenge: {
    id: number;
    week_number: number;
    title: string;
    intro: string[];
    instructions: string[];
    why: string;
    tips: string[];
    closing: string;
  };
  onLogToday: () => void;
  completedDays: number;
  totalDays?: number;
  totalChallenges: number;
  onPrev: () => void;
  onNext: () => void;
}

const MicroChallenge = ({
  challenge,
  onLogToday,
  completedDays,
  totalDays = 7,
  totalChallenges,
  onPrev,
  onNext,
}: MicroChallengeProps) => {
  const [note, setNote] = useState("");

  const handleLog = () => {
    onLogToday();
    setNote("");
  };

  const score = Math.round((completedDays / totalDays) * 100);

  return (
    <div className="bg-[#f0fdff] border border-[#5eb1bf] p-6 rounded-xl shadow-sm mb-6 relative">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={onPrev}
          disabled={challenge.week_number === 1}
          className="text-[#5eb1bf] font-bold disabled:opacity-30"
        >
          ⬅ Previous
        </button>

        <div className="text-sm font-bold text-[#5eb1bf]">
          Week {challenge.week_number}
        </div>

        <button
          onClick={onNext}
          disabled={challenge.id === totalChallenges}
          className="text-[#5eb1bf] font-bold disabled:opacity-30"
        >
          Next ➡
        </button>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-[#042a2b] mb-4">
        {challenge.title}
      </h2>

      {/* Consistency + log button */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        <div className="flex-1 bg-yellow-50 border border-yellow-300 p-4 rounded-md">
          <p className="font-semibold text-[#042a2b] mb-1">
            Consistency Score: {isNaN(score) ? "--" : `${score}%`}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <button
            className="bg-[#5eb1bf] hover:bg-[#4aa2af] text-white font-semibold px-6 py-2 rounded-lg"
            onClick={handleLog}
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

      {/* Content */}
      <div className="text-[#042a2b] space-y-4">
        {challenge.intro.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}

        <div className="border-t border-[#5eb1bf] pt-4">
          <h3 className="font-semibold text-lg mb-2">The Microchallenge:</h3>
          <ol className="list-decimal list-inside space-y-1">
            {challenge.instructions.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="border-t border-[#5eb1bf] pt-4">
          <h3 className="font-semibold text-lg mb-2">Why it works:</h3>
          <p>{challenge.why}</p>
        </div>

        <div className="border-t border-[#5eb1bf] pt-4">
          <h3 className="font-semibold text-lg mb-2">Bonus tip:</h3>
          <ul className="list-disc list-inside space-y-1">
            {challenge.tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>

        <div className="pt-2 font-semibold">{challenge.closing}</div>
      </div>
    </div>
  );
};

export default MicroChallenge;
