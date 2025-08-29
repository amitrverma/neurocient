"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../AuthModal";
import MembershipModal from "../MembershipModal";
import { getUsage, incrementUsage, usageLimits } from "../../utils/usage";
import { trackEvent } from "../../utils/analytics";

interface MicrochallengeBoxProps {
  id: string; // UUID from backend
}

interface Microchallenge {
  id: string;
  title: string;
  why: string;
}

const MicrochallengeBox = ({ id }: MicrochallengeBoxProps) => {
  const { token } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showMembership, setShowMembership] = useState(false);
  const [challenge, setChallenge] = useState<Microchallenge | null>(null);

  // 🔄 Fetch challenge data (open to all, no login required)
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch(`/api/challenges/${id}`);
        if (!res.ok) throw new Error("Failed to fetch challenge");
        const data = await res.json();
        setChallenge(data);
      } catch (err) {
        console.error("Error fetching challenge:", err);
      }
    };

    if (id) {
      fetchChallenge();
    }
  }, [id]);

  // 🚦 Click handler checks login + usage quota
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!token) {
      e.preventDefault();
      setShowAuth(true);
      return;
    }
    if (getUsage("microchallenges", true) >= (usageLimits.user.microchallenges || 0)) {
      e.preventDefault();
      setShowMembership(true);
      return;
    }
    incrementUsage("microchallenges", true);
    trackEvent("Microchallenge Started", { id });
  };

  if (!challenge) {
    return (
      <div className="my-6 p-4 border rounded-lg border-brand-dark shadow-sm">
        <p className="text-sm text-brand-dark">Loading challenge...</p>
      </div>
    );
  }

  return (
    <div className="my-6 p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-[#5eb1bf]" />
        <h3 className="text-lg font-semibold text-[#042a2b]">{challenge.title}</h3>
      </div>

      <p className="text-md text-brand-dark mb-3">{challenge.why}</p>

      <button
        onClick={handleClick}
        data-cta="microchallenge-open"
        className="text-sm font-semibold px-3 py-2 rounded-md border text-brand-dark hover:bg-brand-teal hover:text-white transition"
      >
        Try this Microchallenge
      </button>


      {/* Modals */}
      <MembershipModal
        isOpen={showMembership}
        onClose={() => setShowMembership(false)}
        disableEscape
      />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        disableEscape
      />
    </div>
  );
};

export default MicrochallengeBox;
