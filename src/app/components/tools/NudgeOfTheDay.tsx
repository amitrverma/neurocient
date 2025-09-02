"use client";
import React, { useEffect, useState } from "react";

interface Nudge {
  title?: string;
  type?: string;
  paragraphs?: string[];
  quote?: string;
  link?: string;
}

const NudgeOfTheDay = () => {
  const [nudge, setNudge] = useState<Nudge | null>(null);

  useEffect(() => {
    const fetchNudge = async () => {
      try {
        // 🔄 call your Next.js proxy route instead of hitting API_BASE_URL
        const res = await fetch("/api/nudges/random", {
          credentials: "include", // keep cookies flowing
        });
        if (!res.ok) throw new Error("Failed to fetch nudge");
        const data = await res.json();
        setNudge(data);
      } catch (err) {
        console.error("Failed to fetch nudge", err);
      }
    };
    fetchNudge();
  }, []);

  if (!nudge) return null;

  return (
    <div className="border border-yellow-300 rounded-lg p-5 shadow-sm text-md text-yellow-900 space-y-4 leading-relaxed">
      {nudge.title && <p className="font-semibold text-base">{nudge.title}</p>}
      {nudge.type === "text" ? (
        <p className="italic">“{nudge.paragraphs?.[0] || nudge.quote}”</p>
      ) : (
        <>
          {nudge.paragraphs?.map((p: string, i: number) => <p key={i}>{p}</p>)}
          {nudge.quote && (
            <p className="italic text-[#854d0e] border-l-4 border-yellow-300 pl-4">
              “{nudge.quote}”
            </p>
          )}
          {nudge.link && (
            <a
              href={nudge.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline block pt-2"
            >
              Learn more
            </a>
          )}
        </>
      )}
    </div>
  );
};

export default NudgeOfTheDay;
