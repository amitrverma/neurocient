"use client";

import { motion, useReducedMotion } from "framer-motion";

const ideas = [
  { text: "why you do what you do", accent: "bg-brand-primary" },
  { text: "why modern approaches often fall short", accent: "bg-brand-secondary" },
  { text: "what needs to change at the source", accent: "bg-brand-teal" },
];

export function AnimatedApproach() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="max-w-5xl border-t border-brand-dark/15 pb-2 pt-9 md:pt-12">
      <h3 className="max-w-4xl font-serif text-2xl font-bold leading-[1.25] tracking-[-0.025em] text-brand-dark md:text-4xl md:leading-[1.12]">
        Rooted in{" "}
        <span className="text-brand-primary">
          evolutionary psychology,
        </span>{" "}
        <span className="relative inline bg-[linear-gradient(transparent_68%,rgba(244,201,93,0.48)_68%)]">Neurocient Labs</span>{" "}
        helps you understand.
      </h3>

      <div className="mt-8 max-w-3xl md:mt-10 md:ml-auto">
          <motion.ol
            className="border-y border-brand-dark/15"
            initial={reduceMotion ? false : "hidden"}
            whileInView="visible"
            viewport={{ once: true, amount: 0.45 }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.46 } },
            }}
          >
            {ideas.map((idea) => (
              <motion.li
                key={idea.text}
                className="grid grid-cols-[2.75rem_1fr] items-center gap-4 border-b border-brand-dark/10 py-6 last:border-b-0 md:grid-cols-[3.5rem_1fr] md:gap-5 md:py-7"
                variants={{
                  hidden: {},
                  visible: { transition: { delayChildren: 0.08 } },
                }}
              >
                <motion.span
                  className={`h-1 w-full origin-left rounded-full ${idea.accent}`}
                  aria-hidden="true"
                  variants={{
                    hidden: { scaleX: 0 },
                    visible: { scaleX: 1, transition: { duration: 0.65, ease: "easeOut" } },
                  }}
                />
                <motion.span
                  className="font-serif text-xl font-bold leading-[1.3] text-brand-dark md:text-2xl"
                  variants={{
                    hidden: { opacity: 0, x: 38 },
                    visible: {
                      opacity: 1,
                      x: 0,
                      transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
                    },
                  }}
                >
                  {idea.text}<span className="text-brand-accent">.</span>
                </motion.span>
              </motion.li>
            ))}
          </motion.ol>
      </div>

      <p className="mt-7 max-w-4xl border-l-4 border-brand-primary py-1 pl-5 font-sans text-lg font-semibold leading-[1.55] text-brand-dark md:mt-9 md:pl-6 md:text-2xl md:leading-[1.5]">
        Then it helps you apply those insights in everyday life, so change actually lasts.
      </p>
    </div>
  );
}
