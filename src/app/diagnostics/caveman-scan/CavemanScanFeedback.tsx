"use client";

import { useState } from "react";
import type { ScanScienceBlock } from "./questionsBank";

interface Props {
  reflection: string;
  science: ScanScienceBlock | null;
  onShowScience: () => void;
}

const CavemanScanFeedback = ({ reflection, science, onShowScience }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative bg-white rounded-2xl shadow-lg p-5 text-base text-brand-dark
                    border-t-4 border-brand-teal transition-all">
      
      <div
        className="mb-4 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: reflection }}
      />

      {science && (
        <button
          onClick={onShowScience}
          className="text-brand-accent text-sm hover:underline"
        >
          Want the science?
        </button>
      )}
    </div>
  );
};

export default CavemanScanFeedback;
