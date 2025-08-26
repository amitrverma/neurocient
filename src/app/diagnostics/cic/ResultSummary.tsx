"use client";

import { instinctMap } from "./instinctMap";

interface Props {
  responses: Record<string, string>;
  onRestart: () => void;
}

const motiveLabels: Record<
  string,
  { icon: string; summary: string; microShift: string }
> = {
  "Safety & Self-Protection": {
    icon: "🛡️",
    summary:
      "You may avoid risk, change, or uncertainty — even when it’s needed.",
    microShift:
      "Try building comfort with short-term discomfort through small experiments.",
  },
  "Status & Social Hierarchy": {
    icon: "📈",
    summary: "You may prioritize how you're seen over what works best.",
    microShift:
      "Try creating safer ways to ask for help or revisit plans without judgment.",
  },
  "Affiliation & Belonging": {
    icon: "🧑‍🤝‍🧑",
    summary: "You may avoid conflict to preserve group harmony.",
    microShift:
      "Try normalizing constructive dissent in meetings or feedback.",
  },
};

const countMotives = (responses: Record<string, string>) => {
  const motiveCount: Record<string, number> = {
    "Safety & Self-Protection": 0,
    "Status & Social Hierarchy": 0,
    "Affiliation & Belonging": 0,
  };
  let noIssueCount = 0;

  Object.entries(responses).forEach(([qId, choice]) => {
    const entry = instinctMap[qId]?.[choice];
    if (entry?.motive && motiveCount.hasOwnProperty(entry.motive)) {
      motiveCount[entry.motive]++;
    } else {
      noIssueCount++;
    }
  });

  return { motiveCount, noIssueCount };
};

const ResultSummary = ({ responses, onRestart }: Props) => {
  const { motiveCount, noIssueCount } = countMotives(responses);

  const totalResponses =
    Object.values(motiveCount).reduce((sum, val) => sum + val, 0) + noIssueCount;
  const cavemanScore = Object.values(motiveCount).reduce(
    (sum, val) => sum + val,
    0
  );
  const cavemanPercent = Math.round((cavemanScore / totalResponses) * 100);
  const modernPercent = 100 - cavemanPercent;

  const sortedMotives = Object.entries(motiveCount)
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#f8fafc] font-sans text-dark">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-accent mb-4">
          🧬 Your Caveman Profile
        </h2>
        <p className="mb-4 text-lg text-gray-700">
          Based on your answers, here’s what your underlying behavioral drivers
          look like:
        </p>

        <p className="text-lg text-tertiary font-semibold mb-10">
          🧠 {cavemanPercent}% Caveman in the Cubicle, {modernPercent}% Modern
          Human
        </p>

        <div className="space-y-6">
          {sortedMotives.map(([motive, count]) => (
            <div
              key={motive}
              className="bg-white border border-gray-200 rounded-xl shadow p-5"
            >
              <h3 className="text-xl font-semibold text-tertiary mb-1">
                {motiveLabels[motive].icon} {motive} ({count} triggers)
              </h3>
              <p className="text-sm text-gray-800 mb-2">
                {motiveLabels[motive].summary}
              </p>
              <p className="text-sm text-green-700">
                <strong>🔄 Try this:</strong> {motiveLabels[motive].microShift}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex gap-4 flex-wrap">
          <button
            onClick={onRestart}
            className="px-5 py-2 bg-gray-100 text-sm rounded hover:bg-gray-200 transition"
          >
            Retake Diagnostic
          </button>
          <button className="px-5 py-2 bg-primary text-dark font-semibold rounded hover:bg-yellow-300 transition">
            Start Your First DEI Loop →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultSummary;
