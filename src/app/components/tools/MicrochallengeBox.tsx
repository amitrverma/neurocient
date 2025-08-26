// app/components/MicrochallengeBox.tsx
"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

interface MicrochallengeBoxProps {
  id: number;
  title: string;
  blurb?: string;
}

const MicrochallengeBox = ({ id, title, blurb }: MicrochallengeBoxProps) => {
  return (
    <div className="my-6 p-4 border rounded-lg bg-[#f0fdff] border-[#5eb1bf] shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-[#5eb1bf]" />
        <h3 className="text-lg font-semibold text-[#042a2b]">{title}</h3>
      </div>
      {blurb && <p className="text-sm text-gray-600 mb-3">{blurb}</p>}
      <Link
        href={`/tools/microchallenges#challenge-${id}`}
        className="text-sm font-semibold text-[#5eb1bf] hover:underline"
      >
        Try this Microchallenge →
      </Link>
    </div>
  );
};

export default MicrochallengeBox;
