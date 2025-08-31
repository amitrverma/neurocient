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

  if (spotCount > 0) {
    // sort by date (ascending)
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
    <p className="text-sm text-brand-dark mb-4">
      Your brain runs on ancient wiring. Long before offices, deadlines, and
      smartphones, our ancestors relied on instincts that kept them alive in
      small tribes. Those instincts haven’t gone away—they’re still in you
      today.
      <br /><br />
      We call this your Inner Caveman. It’s the part of you that seeks safety,
      status, belonging, quick rewards, and certainty—whether or not those
      instincts actually serve you in modern life.
      <br /><br />
      Spotting your caveman is about noticing those moments when your ancient
      wiring takes the wheel:
      <br /><br />
      – When one piece of criticism outweighs ten compliments. <br />
      – When you check email instead of tackling strategy. <br />
      – When you hold back an idea in a meeting to avoid standing out.
      <br /><br />
      By spotting these moments, you begin to see the patterns. And once you
      see them, you can start working with them—designing habits, environments,
      and choices that align with how your brain actually works.
      <br /><br />
      This isn’t about fighting your caveman. It’s about recognizing him, and
      learning how to steer with—not against—your wiring.
    </p>
  ) : (
    <p className="text-sm text-brand-dark mb-4">
      Spotting your caveman means noticing the moments when ancient instincts
      show up in modern life—like when one critique stings more than ten
      compliments or when you hold back in a meeting to play it safe. By naming
      these patterns, you build awareness and start steering with your wiring
      instead of against it.
    </p>
  )}

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

  {microSummary.completed < 1 ? (
    <p className="text-sm text-brand-dark mb-4">
      Microchallenges are tiny, science-backed experiments for your daily life.
      They’re not about willpower or discipline. They’re about nudges—small,
      doable actions that work with your ancient wiring instead of against it.
      <br /><br />
      Your ancestors didn’t count calories, schedule gym sessions, or manage
      digital distractions. But they did walk often, pause at sunset, drink
      water when thirsty, and connect face-to-face. Microchallenges are built
      from those timeless patterns, translated into modern habits.
      <br /><br />
      Each challenge is intentionally small: drink a glass of water before your
      first coffee, put your phone away 30 minutes before bed, take a 5-minute
      movement break every hour.
      <br /><br />
      This isn’t about adding pressure. It’s about experimenting playfully with
      your wiring, one small challenge at a time.
    </p>
  ) : (
    <p className="text-sm text-brand-dark mb-4">
      Microchallenges are small, science-backed experiments that help you work
      with your wiring. Think of them as tiny nudges—like a digital sunset, a
      hydration break, or a movement pause—that build awareness and momentum
      without relying on willpower.
    </p>
  )}

  <p className="text-sm text-brand-dark mb-2">
    {microSummary.completed}/{microSummary.total} challenges completed.
  </p>

  <p className="text-sm italic text-brand-dark mb-4">
    Current: “{microSummary.current}”
  </p>

  <Link
    href="/tools/microchallenges"
    className="inline-block border text-brand-dark font-semibold px-6 py-3 rounded-xl shadow hover:bg-brand-teal hover:text-white transition"
  >
    Go to Challenges
  </Link>
</div>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default ToolsPage;
