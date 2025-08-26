"use client";
import React, { useEffect, useState } from "react";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const NudgeOfTheDay = () => {
  const [nudge, setNudge] = useState<any>(null);

  useEffect(() => {
    const fetchNudge = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/nudges/random`);
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
    <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-5 shadow-sm text-sm text-yellow-900 space-y-4 leading-relaxed">
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
            <a href={nudge.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline block pt-2">
              Learn more
            </a>
          )}
        </>
      )}
    </div>
  );
};

export default NudgeOfTheDay;
