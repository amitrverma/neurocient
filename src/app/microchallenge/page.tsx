"use client";

import ProtectedCTA from "../utils/protectedCTA";

export default function MicrochallengePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      {/* WHY */}
      <section className="text-center mb-12">
        <h1 className="text-3xl font-bold text-brand-dark">Microchallenge</h1>
        <p className="mt-4 text-lg text-gray-700">
          Big promises don’t stick. Your caveman brain resists “permanent
          change” — but it’s wired to respond to small, repeatable actions. That’s
          why Microchallenges work: they sneak past resistance and let you feel
          change in just a week.
        </p>
      </section>

      {/* WHAT */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-brand-dark mb-4">What it is</h2>
        <p className="text-gray-700">
          A Microchallenge is a 7-day experiment. One tiny action, repeated daily.
          Simple enough to succeed. Short enough to finish. Powerful enough to
          start rewiring your Inner Caveman.
        </p>
      </section>

      {/* HOW */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-brand-dark mb-4">How it works</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Pick one focus — food, focus, posture, connection, etc.</li>
          <li>Commit to a micro-action for 7 days straight.</li>
          <li>Log completion daily and notice the difference.</li>
        </ul>
        <p className="mt-4 text-gray-700">
          By the end, you don’t just “know” what works — you’ve experienced it.
        </p>
      </section>

      {/* EXAMPLE */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-brand-dark mb-4">
          Example: Posture Reset
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
          <p className="text-gray-700">
            You were never meant to sit for hours. For most of human history,
            your body stayed upright, walking, squatting, carrying. Today we sit
            — and your brain thinks slouching is “normal.”
          </p>

          <h3 className="font-semibold text-brand-dark">The Microchallenge:</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Stand barefoot, feet hip-width apart, knees soft</li>
            <li>Pelvis tucked, spine neutral</li>
            <li>Stack ribcage over hips</li>
            <li>Roll shoulders back & down</li>
            <li>Imagine a string pulling your head tall</li>
            <li>Breathe: 4s in, 6s out</li>
          </ul>

          <h3 className="font-semibold text-brand-dark">Why it works:</h3>
          <p className="text-gray-700">
            Posture isn’t about “trying harder.” It’s about reminding your system
            what it once knew — through tiny, consistent cues.
          </p>

          <h3 className="font-semibold text-brand-dark">When to try it:</h3>
          <p className="text-gray-700">
            After each Zoom call. Before your morning coffee. After standing up.
            One minute, twice a day — start rewiring posture naturally.
          </p>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
         <ProtectedCTA redirect="/tools/microchallenges">
          Join a Microchallenge
        </ProtectedCTA>
      </div>
    </main>
  );
}
