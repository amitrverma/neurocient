"use client";

import { Sparkles, Brain, ShieldCheck, Repeat } from "lucide-react";

const insights = [
  {
    icon: <Sparkles className="w-7 h-7 text-brand-primary mt-1 shrink-0" />,
    text: (
      <>
        <span className="font-semibold text-brand-dark tracking-tight">
          Most advice on change assumes we’re rational, consistent, and linear.
        </span>
        <span className="block mt-1 text-brand-dark/70">
          If we understand the “why,” the “how” should follow.  
          That motivation will show up when we need it.  
          That discipline is just a matter of deciding.
        </span>
      </>
    ),
  },
  {
    icon: <Brain className="w-7 h-7 text-brand-teal mt-1 shrink-0" />,
    text: (
      <>
        <span className="text-brand-dark/80">
          But that’s not how people actually work.
        </span>
        <span className="block mt-1 font-semibold text-brand-dark tracking-tight">
          Knowing isn’t the same as doing
        </span>
        <span className="block mt-1 text-brand-dark/70">
          Awareness lives in one part of the brain.  
          Action is driven by another — the part that responds to emotion, reward,  
          and tribal signals. And it moves first.
        </span>
      </>
    ),
  },
  {
    icon: <ShieldCheck className="w-7 h-7 text-brand-secondary mt-1 shrink-0" />,
    text: (
      <>
        <span className="text-brand-dark/80">
          That’s the caveman in action.
        </span>
        <span className="block mt-1 text-brand-dark/70">
          He doesn’t care about your plans — only what feels safe, familiar,  
          and rewarding right now.
        </span>
        <span className="block mt-1">
          That’s why you slip —{" "}
          <span className="font-semibold text-brand-dark tracking-tight">
            not because you’re lazy
          </span>
          , but because your system is still playing by caveman rules.
        </span>
      </>
    ),
  },
  {
    icon: <Repeat className="w-7 h-7 text-brand-accent mt-1 shrink-0" />,
    text: (
      <>
        <span className="text-brand-dark/80">
          Real, sustained change doesn’t come from insight alone.
        </span>
        <span className="block mt-1 font-semibold text-brand-dark tracking-tight">
          It comes from alignment — of identity, awareness, environment, and rhythm.
        </span>
        <span className="block mt-1 text-brand-dark/70">
          So the part of you that knows better is finally in sync  
          with the part of you that acts.
        </span>
      </>
    ),
  },
];

const ChangeIsHard = () => {
  return (
    <section className="w-full px-6 py-24 bg-white font-serif">
      <div className="max-w-5xl mx-auto space-y-16">

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-brand-dark text-center leading-snug tracking-tight">
          Why change feels so hard —
          <br className="hidden md:block" />
          <span className="inline-block mt-1">
            even when you know what to do
          </span>
        </h2>

        {/* Insight Blocks */}
        <div className="space-y-12">
          {insights.map((block, index) => (
            <div
              key={index}
              className="flex items-start gap-5"
            >
              {block.icon}
              <p className="text-brand-dark/85 leading-relaxed text-[1.05rem] md:text-lg tracking-tight">
                {block.text}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ChangeIsHard;
