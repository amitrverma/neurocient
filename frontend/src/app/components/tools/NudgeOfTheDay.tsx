"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";

interface Nudge {
  title?: string;
  type?: string;
  paragraphs?: string[];
  quote?: string;
  link?: string;
}

const NudgeOfTheDay = () => {
  const [nudge, setNudge] = useState<Nudge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNudge = async () => {
      try {
        const res = await fetch("/api/nudges", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch nudge");
        const data = await res.json();
        setNudge(data);
      } catch (err) {
        console.error("Failed to fetch nudge:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNudge();
  }, []);

  return (
    <section className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
          {loading ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="h-5 w-5" />
          )}
        </span>
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
          Nudge of the day
        </p>
      </div>

      {loading ? (
        <p className="mt-5 font-sans text-sm leading-7 text-brand-dark/72">
          Loading today's prompt.
        </p>
      ) : nudge ? (
        <div className="mt-5 space-y-4 font-sans text-sm leading-7 text-brand-dark/76 md:text-base md:leading-8">
          {nudge.title && (
            <h2 className="font-serif text-3xl font-bold leading-tight text-brand-dark">
              {nudge.title}
            </h2>
          )}

          {nudge.type === "text" ? (
            <p className="border-l-4 border-brand-secondary pl-5 italic">
              "{nudge.paragraphs?.[0] || nudge.quote}"
            </p>
          ) : (
            <>
              {nudge.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
              {nudge.quote && (
                <p className="border-l-4 border-brand-secondary pl-5 italic">
                  "{nudge.quote}"
                </p>
              )}
              {nudge.link && (
                <a
                  href={nudge.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent"
                >
                  Learn more
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}
            </>
          )}
        </div>
      ) : (
        <p className="mt-5 font-sans text-sm leading-7 text-brand-dark/72">
          No nudge is available right now.
        </p>
      )}
    </section>
  );
};

export default NudgeOfTheDay;
