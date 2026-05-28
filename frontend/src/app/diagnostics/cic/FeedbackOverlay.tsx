"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { instinctMap } from "./instinctMap";

interface Props {
  questionId: string;
  option: string;
}

const FeedbackOverlay = ({ questionId, option }: Props) => {
  const [showDetail, setShowDetail] = useState(false);
  const insight = instinctMap[questionId]?.[option];

  useEffect(() => {
    setShowDetail(false);
  }, [questionId, option]);

  if (!insight) return null;

  return (
    <aside className="rounded-lg border border-brand-dark/10 bg-white p-6 shadow-sm">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
        Behavioral read
      </p>

      {insight.instinct ? (
        <>
          <h2 className="mt-3 text-2xl font-bold leading-tight text-brand-dark">
            {insight.instinct}
          </h2>
          {insight.motive && (
            <p className="mt-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
              {insight.motive}
            </p>
          )}
          <p className="mt-4 font-sans text-sm leading-7 text-brand-dark/72">
            {insight.feedback}
          </p>

          <button
            onClick={() => setShowDetail((value) => !value)}
            className="mt-5 inline-flex cursor-pointer items-center gap-2 font-sans text-sm font-semibold text-brand-accent transition hover:text-brand-primary"
          >
            {showDetail ? "Hide the deeper read" : "Why this happens"}
            {showDetail ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showDetail && (
            <div className="mt-5 border-l-4 border-brand-secondary pl-4 font-sans text-sm leading-7 text-brand-dark/72">
              <p>{insight.explanation}</p>
              {insight.microShift && (
                <p className="mt-3">
                  <strong className="text-brand-dark">Try this:</strong>{" "}
                  {insight.microShift}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
          {insight.feedback}
        </p>
      )}
    </aside>
  );
};

export default FeedbackOverlay;
