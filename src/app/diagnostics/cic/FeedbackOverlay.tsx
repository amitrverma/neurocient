"use client";

import { useState, useEffect } from "react";
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
    <div
      className="relative bg-white border border-gray-200 rounded-2xl shadow-lg p-5 text-base text-[var(--color-brand-dark)]
                 transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1"
      style={{ borderTop: `4px solid var(--color-brand-primary)` }}
    >
      {/* Instinct Title */}
      <p className="font-semibold text-[var(--color-brand-dark)] mb-1">
        Instinct: {insight.instinct}
      </p>

      {/* Motive */}
      {insight.motive && (
        <p className="text-sm font-medium mb-4 text-[var(--color-brand-primary)]">
          Caveman Motive: {insight.motive}
        </p>
      )}

      {/* Feedback */}
      <p className="mb-4">{insight.feedback}</p>

      {/* Expandable Details */}
      {insight.instinct &&
        (!showDetail ? (
          <button
            onClick={() => setShowDetail(true)}
            className="text-[var(--color-brand-teal)] underline text-sm mb-2 hover:text-[var(--color-brand-accent)] transition"
          >
            + See why this happens
          </button>
        ) : (
          <div className="space-y-3 text-sm">
            <p>{insight.explanation}</p>
            {insight.microShift && (
              <p className="text-[var(--color-brand-dark)]">
                <strong className="text-[var(--color-brand-primary)]">
                  Try this:
                </strong>{" "}
                {insight.microShift}
              </p>
            )}
          </div>
        ))}
    </div>
  );
};

export default FeedbackOverlay;
