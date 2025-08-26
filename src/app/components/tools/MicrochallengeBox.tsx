"use client";

import Link from "next/link";
import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../AuthModal";

interface MicrochallengeBoxProps {
  id: string; // changed to string since UUIDs are used in backend
}

interface Microchallenge {
  id: string;
  title: string;
  why: string;
}

const MicrochallengeBox = ({ id }: MicrochallengeBoxProps) => {
  const { token } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [challenge, setChallenge] = useState<Microchallenge | null>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch(`/api/challenges/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
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
  }, [id, token]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!token) {
      e.preventDefault();
      setShowAuth(true);
    }
  };

  if (!challenge) {
    return (
      <div className="my-6 p-4 border rounded-lg bg-gray-50 border-gray-200 shadow-sm">
        <p className="text-sm text-gray-500">Loading challenge...</p>
      </div>
    );
  }

  return (
    <div className="my-6 p-4 border rounded-lg bg-[#f0fdff] border-[#5eb1bf] shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-5 h-5 text-[#5eb1bf]" />
        <h3 className="text-lg font-semibold text-[#042a2b]">{challenge.title}</h3>
      </div>

      <p className="text-sm text-gray-600 mb-3">{challenge.why}</p>

      <Link
        href={`/tools/microchallenges#challenge-${challenge.id}`}
        className="text-sm font-semibold text-[#5eb1bf] hover:underline"
        onClick={handleClick}
      >
        Try this Microchallenge →
      </Link>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
};

export default MicrochallengeBox;
