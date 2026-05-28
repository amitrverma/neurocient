"use client";

import React from "react";

// ===========================
// Types
// ===========================
interface ListItem {
  text: string;
}

// ===========================
// Component
// ===========================
const WhoIsThisFor: React.FC = () => {
  const forList: ListItem[] = [
    { text: "You’ve done the books, podcasts, planners — and still feel stuck" },
    { text: "You’re not chasing hacks — just something that actually works" },
    { text: "You start strong, but keeping it up feels impossible" },
    { text: "You care more about momentum than motivation" },
    { text: "You know the gap isn’t knowledge — it’s follow-through" },
    { text: "You’re ready to stop fighting your inner caveman — and start working with him" },
  ];

  const notForList: ListItem[] = [
    { text: "You’ve made peace with the distractions — even if they’re quietly draining you" },
    { text: "You’re not ready to question the habits you’ve stopped noticing" },
    { text: "You think your inner caveman just needs to ‘try harder’" },
    { text: "You think motivation is the answer" },
    { text: "You want quick hacks, not honest habits" },
    { text: "You expect change without reflection (or a little discomfort)" },
    { text: "You reject the science of human evolution" },
  ];

  return (
    <section className="w-full px-6 py-20 bg-white font-serif">
      
      {/* ===========================
          Two-Column Grid
      ============================ */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">

        {/* FOR YOU */}
        <div className="bg-brand-secondary/10 border-l-4 border-brand-secondary p-6 rounded-2xl shadow-sm">
          <div className="flex items-center mb-5">
            <div className="bg-brand-secondary text-brand-dark text-lg rounded-full w-10 h-10 flex items-center justify-center mr-3">
              ✅
            </div>
            <h3 className="text-xl font-semibold text-brand-dark">
              This Is For You If…
            </h3>
          </div>

          <ul className="space-y-3 text-brand-dark/80 text-base leading-relaxed">
            {forList.map((item: ListItem, i: number) => (
              <li key={i} className="flex items-start">
                <span className="text-brand-teal mr-2 mt-1">•</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* NOT FOR YOU */}
        <div className="bg-brand-primary/10 border-l-4 border-brand-primary p-6 rounded-2xl shadow-sm">
          <div className="flex items-center mb-5">
            <div className="bg-brand-primary text-white text-lg rounded-full w-10 h-10 flex items-center justify-center mr-3">
              🚫
            </div>
            <h3 className="text-xl font-semibold text-brand-dark">
              This Probably Isn’t For You If…
            </h3>
          </div>

          <ul className="space-y-3 text-brand-dark/80 text-base leading-relaxed">
            {notForList.map((item: ListItem, i: number) => (
              <li key={i} className="flex items-start">
                <span className="text-brand-accent mr-2 mt-1">•</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ===========================
          Closing Narrative
      ============================ */}
      <div className="max-w-3xl mx-auto mt-20 text-center px-4 space-y-6">
        <p className="text-lg italic text-brand-dark/70 leading-relaxed">
          This isn’t a motivational bonfire.  
          <br className="hidden md:block" />
          It’s a blueprint for slow, steady, real change —
          <br className="hidden md:block" />
          even if your caveman throws a tantrum at first.
        </p>

        <p className="text-brand-dark/80 text-lg leading-relaxed">
          By now, you already know the problem isn’t a lack of insight.
          It’s the absence of a system that works <em>with</em> you — not against you.
        </p>

        <p className="text-2xl font-semibold text-brand-dark">
          <span className="text-brand-primary">The Modern Caveman</span> is that system.
        </p>

        <p className="text-brand-dark/80 text-lg">
          Let’s make this the last time you start over.
        </p>
      </div>
    </section>
  );
};

export default WhoIsThisFor;
