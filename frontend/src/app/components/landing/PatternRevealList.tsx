"use client";

import { useEffect, useRef, useState } from "react";

const patterns = [
  "Constant distraction.",
  "Persistent pressure.",
  "Endless comparison.",
  "Delaying what matters.",
  "Unceasing guilt.",
  "Growing disconnection.",
  "Too much on your mind.",
];

export default function PatternRevealList() {
  const rootRef = useRef<HTMLUListElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <ul
      ref={rootRef}
      className="relative mt-8 min-h-52 border-t border-brand-primary/60 px-6 py-8 font-serif text-xl font-bold leading-9 text-brand-dark md:col-span-4 md:col-start-3 md:min-h-64 md:px-8 md:py-10 md:text-3xl md:leading-[1.35]"
    >
      <li
        aria-hidden="true"
        role="presentation"
        className={`absolute bottom-0 left-0 top-0 w-1 origin-top bg-brand-primary transition-transform duration-700 motion-reduce:scale-y-100 motion-reduce:transition-none ${revealed ? "scale-y-100" : "scale-y-0"}`}
      />
      {patterns.map((pattern, index) => (
        <li
          key={pattern}
          className={`flex items-baseline gap-3 border-b border-brand-dark/10 py-2 transition duration-500 first:pt-0 last:border-b-0 last:pb-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none ${revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
          style={{ transitionDelay: revealed ? `${180 + index * 120}ms` : "0ms" }}
        >
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary transition-transform duration-300 motion-reduce:scale-100 ${revealed ? "scale-100" : "scale-0"}`}
          />
          <span>{pattern}</span>
        </li>
      ))}
    </ul>
  );
}
