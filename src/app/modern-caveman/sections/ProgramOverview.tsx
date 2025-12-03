"use client";

import React, { useState } from "react";
import WeekCard from "./WeekCard";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const weeks = [
  {
    title: "Week 1: Live Session 1 (90 mins)",
    modules: ["🧠 Recognise", "🪞 Reflect (Physical + Mental)"],
    bullets: [
      "Understand why traditional approaches don’t stick — and why that’s not your fault",
      "Meet your ‘inner caveman’ and identify your go-to patterns under stress",
      "Reflect on how your body and mind react in ways that made sense in the past, but trip you up now",
      "Begin mapping the friction between how you want to show up and how you actually do",
    ],
    tools: [
      "“Spot Your Caveman” worksheet",
      "Physical + mental behavior scans",
      "Daily nudges begin after the session",
    ],
  },
  {
    title: "Week 2: Integration & Awareness Week",
    modules: ["Apply Recognise + Reflect"],
    bullets: [
      "Daily nudges (quick, practical prompts)",
      "Track recurring loops (‘What keeps hijacking my day?’)",
      "Optional micro-challenges (e.g. ‘Change one thing in your environment’)",
      "Community thread: ‘What surprised you this week?’",
    ],
    tools: ["Real-time awareness without overwhelm"],
  },
  {
    title: "Week 3: Live Session 2 (90 mins)",
    modules: ["🤝 Reflect (Social)", "🛠 Rebuild (IKEA Framework)"],
    bullets: [
      "Explore how approval, comparison, and belonging still run the show",
      "Reflect on how other people (and imagined judgment) shape your energy, habits, and triggers",
      "Learn the IKEA Framework: Identity → Knowledge → Environment → Action",
      "Build your personal IKEA loop live — so change doesn’t rely on willpower anymore",
    ],
    tools: [
      "Social Triggers Map",
      "IKEA Builder worksheet",
      "Optional peer breakout or share-back",
    ],
  },
  {
    title: "Week 4: Application & Setup Week",
    modules: ["Rebuild in Practice"],
    bullets: [
      "Nudges focused on each part of IKEA (e.g., ‘Make one identity-aligned decision today’)",
      "Community thread: ‘Which letter in IKEA is making the biggest difference for you?’",
      "Option to share your IKEA loop for feedback or support",
      "Invitation to join the Caveman Circle (optional community space)",
    ],
    tools: ["Sustainable rhythm, not just a one-time fix"],
  },
];

const ProgramOverview = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="w-full px-6 py-20 bg-white font-serif">
      {/* ===========================
          Section Intro
      ============================ */}
      <div className="text-center max-w-5xl mx-auto mb-16 space-y-8">
        <h2 className="text-2xl md:text-4xl font-bold text-brand-dark">
          What You’ll Experience
        </h2>

        <p className="text-lg text-brand-dark/70 leading-relaxed">
          This isn’t just another insight or self-help idea.
          <br />
          It’s a{" "}
          <span className="text-brand-primary font-semibold">structure</span>,{" "}
          <span className="text-brand-accent font-semibold">support</span>,{" "}
          and{" "}
          <span className="text-brand-secondary font-semibold">
            sustainable shift
          </span>{" "}
          — grounded in how humans *actually* work.
        </p>

        <div className="bg-brand-teal/10 border p-4 rounded-xl">
          <p className="text-brand-dark/80 text-lg leading-relaxed">
            You won’t need more motivation.
            <br />
            You’ll build systems that work even on your worst days.
          </p>
        </div>

        <p className="italic text-brand-accent text-lg">
          Here’s what’s inside The Modern Caveman ↓
        </p>
      </div>

      {/* ===========================
          Carousel Wrapper
      ============================ */}
      <div className="w-full max-w-5xl min-h-[520px] mx-auto relative">

        {/* Carousel Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.45 }}
            className="h-full flex items-center justify-center"
          >
            <WeekCard {...weeks[activeIndex]} />
          </motion.div>
        </AnimatePresence>

        {/* Left Arrow */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2">
          <button
            onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
            disabled={activeIndex === 0}
            className={`p-2 rounded-full transition ${
              activeIndex === 0
                ? "text-brand-dark/20 cursor-not-allowed"
                : "text-brand-dark hover:bg-gray-100"
            }`}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Right Arrow */}
        <div className="absolute top-1/2 right-0 -translate-y-1/2">
          <button
            onClick={() =>
              setActiveIndex((prev) => Math.min(prev + 1, weeks.length - 1))
            }
            disabled={activeIndex === weeks.length - 1}
            className={`p-2 rounded-full transition ${
              activeIndex === weeks.length - 1
                ? "text-brand-dark/20 cursor-not-allowed"
                : "text-brand-dark hover:bg-gray-100"
            }`}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-3 mt-6">
          {weeks.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-3 w-3 rounded-full transition-all duration-300 outline-none ring-offset-2 focus:ring-2 ${
                activeIndex === index
                  ? "bg-brand-dark scale-110"
                  : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ===========================
          Post Program Section
      ============================ */}
      <div className="max-w-4xl mx-auto text-center mt-20 space-y-10">
        <h3 className="text-xl md:text-2xl font-semibold text-brand-dark">
          Your Caveman Crew, Forever.
        </h3>

        <p className="text-lg text-brand-dark/70 leading-relaxed">
          This isn’t just a 4-week sprint.
          <br />
          The circle, the nudges, the support —
          <br />
          they’re with you, every step of the way.
        </p>

        <div className="space-y-5 text-left">
          <div className="bg-brand-secondary/10 p-4 rounded-lg border-l-4 border-brand-secondary">
            <p className="font-semibold text-brand-dark">💬 Caveman Circle</p>
            <p className="text-brand-dark/70">
              Ongoing support, shared momentum, and honest check-ins.
            </p>
          </div>

          <div className="bg-brand-primary/10 p-4 rounded-lg border-l-4 border-brand-primary">
            <p className="font-semibold text-brand-dark">🧭 1:1 Guidance</p>
            <p className="text-brand-dark/70">
              Optional private sessions if you need deeper help.
            </p>
          </div>

          <div className="bg-brand-accent/10 p-4 rounded-lg border-l-4 border-brand-accent">
            <p className="font-semibold text-brand-dark">📬 Nudges</p>
            <p className="text-brand-dark/70">
              Gentle reminders to help your new rhythm stick.
            </p>
          </div>
        </div>

        <p className="italic text-brand-accent text-lg mt-8">
          Because real change takes time —  
          the support stays as long as you need it.
        </p>
      </div>
    </section>
  );
};

export default ProgramOverview;
