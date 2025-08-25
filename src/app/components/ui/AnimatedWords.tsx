// app/components/AnimatedWords.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const words = [
  "Procrastination.",
  "Distraction.",
  "Self-sabotage.",
  "Stress.",
  "Overwhelm.",
  "Anxiety.",
  "Burnout.",
  "Fear of failure.",
];

const AnimatedWords = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % words.length),
      2500
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex justify-center">
      <AnimatePresence mode="wait">
        <motion.h2
          key={words[index]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl text-[#042a2b] text-center"
        >
          {words[index]}
        </motion.h2>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedWords;
