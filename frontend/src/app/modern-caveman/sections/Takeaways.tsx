"use client";

import React from "react";

// ===========================
// Types
// ===========================
interface TakeawayItem {
  icon: string;
  title: string;
  text: string;
}

// ===========================
// Data
// ===========================
const takeaways: TakeawayItem[] = [
  {
    icon: "🧠",
    title: "A Clearer Lens on Your Caveman",
    text: "You’ll stop blaming yourself for inconsistency — and start seeing your behavior through a new lens: a brain wired for short-term safety, reacting to comfort, status, or approval. That single shift in perspective can change how you plan, respond, and bounce back.",
  },
  {
    icon: "🔦",
    title: "Pattern Recognition (Without the Guilt)",
    text: "You’ll learn to name what’s hijacking your day — and why. No more vague self-awareness. You’ll understand the instinct behind the action — and how to gently reroute it.",
  },
  {
    icon: "🛠",
    title: "Environment That Nudges, Not Fights",
    text: "Your caveman resists anything that feels risky or unfamiliar. So instead of forcing habits, you’ll make tiny environmental shifts — to your phone, your desk, your morning flow — that nudge the behavior you want. Less fight, more follow-through.",
  },
  {
    icon: "🔄",
    title: "Your Personal IKEA Loop",
    text: "You’ll build your own IKEA loop — a simple tool that helps you realign when life gets messy. It’s not a plan to follow. It’s a rhythm you’ll create. And when things slip (because they will), you’ll have a way to reset — without starting over.",
  },
];

// ===========================
// Component
// ===========================
const Takeaways: React.FC = () => {
  return (
    <section className="mc-section mc-takeaways">
      <div className="mc-wide">

        {/* ===========================
            Top: Text Section
        ============================ */}
        <div className="mc-section-heading">
          <span className="mc-kicker">What stays with you</span>
          <h2>
            What Will You Walk Away With?
          </h2>

          <p className="text-lg text-brand-dark/70 leading-relaxed">
            You won’t just leave with insight — you’ll leave with a design your caveman
            doesn’t resist. Discipline sticks because it finally fits your wiring.
          </p>

          <blockquote className="italic text-brand-accent border-l-4 border-brand-primary pl-5 leading-relaxed text-lg">
            <p>
              This is how real change happens:
              <br />Not by overpowering your caveman — but by working with him.
              <br /><br />
              You won’t just finish this program knowing what to do.
              <br />You’ll finally have a way to keep doing it, even on your off days.
            </p>
          </blockquote>
        </div>

        {/* ===========================
            Bottom: Cards Grid
        ============================ */}
        <div className="mc-outcome-grid">
          {takeaways.map((item: TakeawayItem, index: number) => (
            <div
              key={index}
              className="mc-outcome-item"
            >
              <div className="text-3xl mb-4">{item.icon}</div>

              <h3 className="text-lg md:text-xl font-semibold text-brand-dark mb-2">
                {item.title}
              </h3>

              <p className="text-brand-dark/70 leading-relaxed text-base">
                {item.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Takeaways;
