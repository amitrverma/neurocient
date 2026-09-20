"use client";

import { BookOpenCheck, Target } from "lucide-react";

// ===========================
// Types
// ===========================
interface WeekCardProps {
  title: string;
  modules: string[];
  bullets: string[];
  tools: string[];
}

// ===========================
// Component
// ===========================
const WeekCard: React.FC<WeekCardProps> = ({
  title,
  modules,
  bullets,
  tools,
}) => {
  const isLiveSession = title.toLowerCase().includes("live session");
  const isApplicationWeek =
    title.toLowerCase().includes("week 2") ||
    title.toLowerCase().includes("week 4");

  return (
    <div className="w-full bg-white border rounded-2xl shadow-sm p-6 md:p-8 font-serif flex flex-col gap-10 max-w-5xl">

      {/* Title */}
      <h3 className="text-xl md:text-2xl font-bold text-brand-dark leading-snug">
        {title}
      </h3>

      {/* Modules / Focus Label */}
      <div className="space-y-4">
        {(isLiveSession || isApplicationWeek) && (
          <div className="flex items-center gap-2 text-brand-dark/70 text-sm font-medium">
            {isLiveSession ? (
              <BookOpenCheck className="w-5 h-5 text-brand-primary" />
            ) : (
              <Target className="w-5 h-5 text-brand-accent" />
            )}
            <span>{isLiveSession ? "Modules Covered:" : "Focus:"}</span>
          </div>
        )}

        {/* Module Tags */}
        <div className="flex flex-wrap gap-2">
          {modules.map((mod: string, idx: number) => (
            <span
              key={idx}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium ${
                isLiveSession
                  ? "border-brand-secondary text-brand-secondary"
                  : "border-brand-accent text-brand-accent"
              }`}
            >
              {mod}
            </span>
          ))}
        </div>
      </div>

      {/* Bullet List */}
      <ul className="space-y-3 text-brand-dark/80 text-base md:text-lg leading-relaxed">
        {bullets.map((b: string, i: number) => (
          <li key={i} className="flex items-start">
            <span className="mr-2 text-brand-secondary font-bold">–</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>

      {/* Tools Block */}
      <div className="bg-brand-secondary/10 border border-brand-secondary rounded-xl p-6 shadow-sm">
        <p className="font-semibold text-brand-dark mb-4 text-lg">
          🛠️ Tools & Support
        </p>

        <ul className="list-disc list-inside space-y-2 text-brand-dark/80 text-base">
          {tools.map((t: string, i: number) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WeekCard;
