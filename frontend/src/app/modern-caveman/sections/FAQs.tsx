"use client";

import React, { useState } from "react";

// ===========================
// Types
// ===========================
interface FAQItem {
  q: string;
  a: string;
}

// ===========================
// Data
// ===========================
const faqs: FAQItem[] = [
  {
    q: "What if I’ve already tried other habit systems, courses, or planners — and none of them worked?",
    a: `Then you're exactly who this was built for.

The truth is, most systems rely on willpower, motivation, and unrealistic routines.

They assume your modern mind is in charge. But your inner caveman disagrees.

He’s still scanning for safety, comfort, status, and belonging — and anything that threatens that gets quietly rejected.

The Modern Caveman doesn’t fight that part of you. It works with it.

This isn’t about more motivation. It’s about traction.

We help you stop circling the same patterns — by designing change that actually fits the way you’re wired.`,
  },
  {
    q: "Do I need to follow a strict schedule or daily routine?",
    a: `Nope.

This isn’t a 5AM club or “do this for 21 days straight” kind of program.

You’ll learn how to spot patterns, shift your environment, and build momentum inside your current reality — not an idealized one.

Because the caveman in you hates rigidity. He resists anything unfamiliar or risky.

So we build systems that feel safe, familiar, and adaptable. That’s how change sticks.`,
  },
  {
    q: "What if I fall off track midway?",
    a: `You will. That’s normal. We plan for it.

This isn’t about perfection — it’s about designing a path where falling off doesn’t mean starting over.

Your caveman brain prioritizes short-term relief over long-term goals. Instead of guilt, you’ll learn how to return gently, with clarity — not punishment.`,
  },
  {
    q: "How long is the program? Will I have enough time?",
    a: `The core experience is 4 weeks — each week focused on a key dimension of transformation.

But the tools, nudges, and frameworks are yours for life.

Use them at your own pace. Revisit them whenever you need.

This isn’t about rushing. It’s about rhythm — one that works with real life.`,
  },
  {
    q: "I’m not a “self-help” person. Will this feel too soft or woo-woo?",
    a: `No fluff here.

This program draws from evolutionary psychology, behavioral design, and human-centered systems thinking.

You’ll learn exactly why certain behaviors are hard to change — and how primal motives like safety, affiliation, and status still shape your daily choices.

It’s not about good vibes.  
It’s about good *design* — for your brain and your life.`,
  },
  {
    q: "Will this work for someone like me?",
    a: `If you've ever known what to do but struggled to do it — yes.

If you’ve ever felt inconsistent despite caring deeply — yes.

If you’re thoughtful, reflective, and tired of circling the same loops — absolutely.

This wasn’t built for perfect people.  
It was built for explorers.`,
  },
  {
    q: "What exactly are nudges — and why are they part of this program?",
    a: `Nudges are gentle, timely reminders that help you stay aligned with your goals — especially when old habits try to pull you off track.

They help you:

• Refocus attention  
• Spark quick insight  
• Take small action  
• Avoid autopilot  

Nudges don’t rely on willpower. They help you act even on busy or low-energy days.`,
  },
  {
    q: "What Is the IKEA Framework?",
    a: `The IKEA Framework helps behavior stick by aligning with your brain’s natural tendencies.

Identity → Knowledge → Environment → Action

• Identity — You act in ways that match who you believe you are  
• Knowledge — Understand your patterns and why you get stuck  
• Environment — Shape surroundings to support the right actions  
• Action — When those align, effort drops and follow-through rises  

You’ll build your personal IKEA loop during the program.

It’s not a rulebook — it’s a way to stay in sync with yourself.`,
  },
];

// ===========================
// Component
// ===========================
const FAQs: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) =>
    setOpenIndex(openIndex === index ? null : index);

  return (
    <section className="w-full px-6 py-20 bg-white font-serif">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <h2 className="text-2xl md:text-4xl font-bold text-brand-dark text-center mb-14">
          Frequently Asked Questions
        </h2>

        {/* FAQ List */}
        <div className="divide-y divide-brand-accent/30">
          {faqs.map((faq: FAQItem, index) => (
            <div key={index}>

              {/* Question Button */}
              <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center py-4 text-left transition-colors"
              >
                <span
                  className={`text-lg font-medium ${
                    openIndex === index
                      ? "text-brand-secondary"
                      : "text-brand-dark"
                  }`}
                >
                  {faq.q}
                </span>

                <span className="text-2xl text-brand-dark/50">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

              {/* Answer */}
              {openIndex === index && (
                <div className="py-3 pl-4 border-l-4 border-brand-secondary text-brand-dark/80 whitespace-pre-line leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQs;
