"use client";

import React from "react";

// ===========================
// Types
// ===========================
interface ShiftItem {
  title: string;
  icon: string;
  text: string;
}

// ===========================
// Data
// ===========================
const shifts: ShiftItem[] = [
  {
    title: "Design Your Surroundings",
    icon: "🌿",
    text: "Because your environment makes more decisions than you realize. You’ll learn how to shape it to support default follow-through, not constant effort.",
  },
  {
    title: "Respond to Social Triggers",
    icon: "👥",
    text: "Understand how comparison, rejection, and approval-seeking shape your behavior — and how to reclaim control in social loops.",
  },
  {
    title: "Decide Under Pressure",
    icon: "🧠",
    text: "Learn how to make decisions when tired, distracted, or overwhelmed — by working with your wiring, not against it.",
  },
  {
    title: "Shape Your Daily Rhythm",
    icon: "🔁",
    text: "Build days where the behavior you want happens by default. No more force. Just fit.",
  },
];

// ===========================
// Component
// ===========================
const ProgramShift: React.FC = () => {
  return (
    <section className="w-full px-6 py-20 bg-white font-serif">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* ===========================
            Top: Header Section
        ============================ */}
        <div className="max-w-3xl space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold text-brand-dark leading-snug">
            <span className="text-brand-accent">Reshape</span> your habits, decisions,
            <br />
            choices, and daily environment
          </h2>

          <p className="text-lg text-brand-dark/70 leading-relaxed">
            This isn’t theory — it’s hands-on work with the things that silently shape your day.
          </p>
        </div>

        {/* ===========================
            Bottom: Cards in a 4-Card Grid
        ============================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {shifts.map((shift: ShiftItem, index: number) => (
            <div
              key={index}
              className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 bg-brand-secondary/20 rounded-full mb-4 text-xl">
                {shift.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg md:text-xl font-semibold text-brand-dark mb-2">
                {shift.title}
              </h3>

              {/* Body */}
              <p className="text-brand-dark/70 leading-relaxed text-base">
                {shift.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ProgramShift;
