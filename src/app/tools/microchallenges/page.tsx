"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../../components/AuthModal";

const MicrochallengesPage = () => {
  // mock data
  const challenges = [
    {
      id: 1,
      title: "Hydrate Like a Caveman",
      status: "In Progress",
      intro: [
        "Most of us mistake thirst for hunger and end up eating instead of hydrating.",
        "This challenge is about reconnecting with your body’s real signals.",
      ],
      instructions: [
        "Start your morning with a full glass of water.",
        "Keep a bottle at your desk — sip regularly.",
        "Before each meal, drink half a glass.",
      ],
      why: "Hydration regulates mood, energy, and focus.",
      tips: ["Add a slice of lemon", "Set a reminder if you forget"],
      closing: "By week’s end, you’ll notice better focus and fewer snack cravings.",
      relatedArticles: [
        { title: "Why Your Brain Craves Water", slug: "why-your-brain-craves-water" },
      ],
    },
    {
      id: 2,
      title: "Digital Sunset",
      status: "Completed",
      intro: ["Wind down without screens to improve your sleep quality."],
      instructions: ["Turn off devices 1 hour before bed.", "Use warm light instead of blue light."],
      why: "Blue light suppresses melatonin, disrupting sleep cycles.",
      tips: ["Keep phone outside bedroom", "Read a book before bed"],
      closing: "Better sleep improves focus and mood.",
      relatedArticles: [
        { title: "How Screens Hijack Your Sleep", slug: "screens-and-sleep" },
      ],
    },
    {
      id: 3,
      title: "Move Every Hour",
      status: "Not Started",
      intro: ["Modern life keeps us sedentary, but our caveman bodies are built to move."],
      instructions: [
        "Stand up once every hour.",
        "Do a quick stretch or walk for 2 minutes.",
      ],
      why: "Frequent movement improves circulation and reduces stress.",
      tips: ["Set a timer", "Take calls while walking"],
      closing: "Small movements compound into big health gains.",
      relatedArticles: [
        { title: "The Cost of Sitting Too Long", slug: "cost-of-sitting" },
      ],
    },
  ];

  const [openId, setOpenId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  const { token } = useAuth();

  const toggleOpen = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  const handleLog = () => {
    if (!token) {
      setShowAuth(true);
      return;
    }
    console.log("✔ Logged today!");
    setNote("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#042a2b] mb-6">⚡ Microchallenges</h1>

      <p className="text-gray-600 mb-6">
        Track your weekly microchallenges here. Complete them to build consistency and strengthen new habits.
      </p>

      <div className="space-y-4">
        {challenges.map((c) => (
          <div key={c.id} className="border rounded-lg overflow-hidden">
            {/* Accordion header */}
            <button
              onClick={() => toggleOpen(c.id)}
              className="w-full flex justify-between items-center px-4 py-3 bg-white hover:bg-gray-50 transition"
            >
              <span className="text-sm font-medium text-[#042a2b]">{c.title}</span>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  c.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : c.status === "In Progress"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {c.status}
              </span>
            </button>

            {/* Accordion content */}
            {openId === c.id && (
              <div className="bg-[#f0fdff] border-t border-[#5eb1bf] p-6 text-[#042a2b] space-y-6">
                {/* Intro */}
                {c.intro.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}

                {/* Instructions */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">The Microchallenge:</h3>
                  <ol className="list-decimal list-inside space-y-1">
                    {c.instructions.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>

                {/* Why */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Why it works:</h3>
                  <p>{c.why}</p>
                </div>

                {/* Tips */}
                <div>
                  <h3 className="font-semibold text-lg mb-2">Bonus tip:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {c.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>

                {/* Closing */}
                <p className="pt-2 font-semibold">{c.closing}</p>

                {/* Notes + Log */}
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

                {/* Related articles */}
                {c.relatedArticles && c.relatedArticles.length > 0 && (
                  <div className="border-t border-[#5eb1bf] pt-4">
                    <h3 className="font-semibold text-lg mb-2">📚 Related Insights</h3>
                    <ul className="list-disc list-inside text-sm space-y-1 text-[#5eb1bf]">
                      {c.relatedArticles.map((a, idx) => (
                        <li key={idx}>
                          <Link href={`/insights/${a.slug}`} className="hover:underline">
                            {a.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
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
