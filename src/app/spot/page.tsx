"use client";

import ProtectedCTA from "../utils/protectedCTA";

export default function SpotPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      {/* WHY */}
      <section className=" mb-12">
        <h1 className="text-3xl font-bold text-brand-dark">Spot Your Caveman</h1>
        <p className="mt-4 text-lg text-gray-700">
          Your Inner Caveman still runs the show more often than you think.  
          Reaching for snacks when you’re not hungry. Dodging hard conversations.  
          Checking your phone mid-meeting.  
          These aren’t random slips — they’re ancient instincts playing out in
          modern life.
        </p>
      </section>

      {/* WHAT */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-brand-dark mb-4">What it is</h2>
        <p className="text-gray-700">
          Spot Your Caveman is a simple practice of pausing and logging when your
          caveman brain takes over. It’s not about judgment — it’s about building
          awareness of patterns you usually miss.
        </p>
      </section>

      {/* HOW */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-brand-dark mb-4">How it works</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Pause when you notice an unhelpful impulse or reaction.</li>
          <li>Reflect for a moment — what triggered it?</li>
          <li>Log it with a short note: time, situation, behavior.</li>
        </ul>
        <p className="mt-4 text-gray-700">
          Over time, your log becomes a mirror — revealing the “when, where, and
          how” of your caveman patterns.
        </p>
      </section>

      {/* EXAMPLE */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-brand-dark mb-4">
          Example Spot Log
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-3">
          <div>
            <span className="block text-sm text-gray-500">🗓 Today, 3:00 PM</span>
            <p className="text-gray-800">
              Reached for my phone during a meeting when it buzzed.  
              Caveman chasing status signals instead of focusing.
            </p>
          </div>
          <div>
            <span className="block text-sm text-gray-500">🗓 Yesterday, 10:30 PM</span>
            <p className="text-gray-800">
              Opened fridge even though I wasn’t hungry.  
              Caveman craving comfort food late at night.
            </p>
          </div>
          <div>
            <span className="block text-sm text-gray-500">🗓 Last week</span>
            <p className="text-gray-800">
              Avoided giving feedback to a teammate.  
              Caveman brain feared conflict and rejection.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
         <ProtectedCTA redirect="/tools/spots">
          Start Spotting Your Caveman →
        </ProtectedCTA>
      </div>
    </main>
  );
}
