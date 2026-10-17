"use client";

import { motion, useReducedMotion } from "framer-motion";

const ideas = [
  { number: "01", text: "why you do what you do", accent: "bg-brand-primary" },
  { number: "02", text: "why modern approaches often fall short", accent: "bg-brand-secondary" },
  { number: "03", text: "what needs to change at the source", accent: "bg-brand-teal" },
];

export function AnimatedApproach() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="max-w-5xl border-t border-brand-dark/15 pb-2 pt-9 md:pt-12"
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.14 } } }}
    >
      <motion.h3
        className="max-w-4xl font-serif text-3xl font-bold leading-[1.18] tracking-[-0.025em] text-brand-dark md:text-5xl md:leading-[1.08]"
        variants={{
          hidden: { opacity: 0, y: 18 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
        }}
      >
        Rooted in{" "}
        <span className="text-brand-primary">
          evolutionary psychology,
        </span>{" "}
        <span className="relative inline-block whitespace-nowrap">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-[0.08em] h-[0.22em] bg-brand-secondary/50"
          />
          <span className="relative">Neurocient Labs</span>
        </span>{" "}
        helps you understand.
      </motion.h3>

      <div className="relative mt-8 max-w-3xl md:ml-auto md:mt-10">
        <motion.div
          className="absolute bottom-3 left-[1.1rem] top-3 w-px origin-top bg-brand-dark/15"
          aria-hidden="true"
          variants={{
            hidden: { scaleY: 0 },
            visible: { scaleY: 1, transition: { duration: 0.75, ease: "easeOut" } },
          }}
        />
        <ol className="relative space-y-3">
          {ideas.map((idea) => (
            <motion.li
              key={idea.number}
              className="grid grid-cols-[2.25rem_1fr] items-start gap-4 rounded-xl border border-brand-dark/10 bg-white/80 p-4 shadow-[0_12px_32px_-28px_rgba(4,42,43,0.6)] md:gap-5 md:p-5"
              variants={{
                hidden: { opacity: 0, x: 24 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
            >
              <span className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full ${idea.accent} font-sans text-xs font-bold text-white`}>
                {idea.number}
              </span>
              <span className="pt-0.5 font-serif text-xl font-bold leading-[1.3] text-brand-dark md:text-2xl">
                {idea.text}<span className="text-brand-accent">.</span>
              </span>
            </motion.li>
          ))}
        </ol>
      </div>

      <motion.p
        className="mt-7 max-w-4xl border-l-4 border-brand-primary py-1 pl-5 font-sans text-lg font-semibold leading-[1.55] text-brand-dark md:mt-9 md:pl-6 md:text-2xl md:leading-[1.5]"
        variants={{
          hidden: { opacity: 0, y: 14 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
        }}
      >
        Then it helps you apply those insights in everyday life, so change actually lasts.
      </motion.p>
    </motion.div>
  );
}
