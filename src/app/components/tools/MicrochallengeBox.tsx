"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../AuthModal";
import MembershipModal from "../MembershipModal";
import { getUsage, incrementUsage, usageLimits } from "../../utils/usage";
import { trackEvent } from "../../utils/analytics";
import { useNotification } from "../NotificationProvider";

interface MicrochallengeBoxProps {
  id: string; // UUID from backend
}

interface Microchallenge {
  id: string;
  title: string;
  why: string;
}

const MicrochallengeBox = ({ id }: MicrochallengeBoxProps) => {
  const { user, ready } = useAuth();
  const router = useRouter();
  const { notify } = useNotification();

  const [showAuth, setShowAuth] = useState(false);
  const [showMembership, setShowMembership] = useState(false);
  const [challenge, setChallenge] = useState<Microchallenge | null>(null);
  const [assigning, setAssigning] = useState(false); // ⏳ disable button while assigning
  const [alreadyAssigned, setAlreadyAssigned] = useState(false); // ✅ state for active challenge

  // 🔄 Fetch challenge data (public)
  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch(`/api/challenges/${id}`);
        if (!res.ok) throw new Error("Failed to fetch challenge");
        const data = await res.json();
        setChallenge(data);
      } catch (err) {
        console.error("❌ Error fetching challenge:", err);
      }
    };

    if (id) fetchChallenge();
  }, [id]);

  // 🚦 Try assigning challenge
  const startChallenge = async () => {
    setAssigning(true);
    incrementUsage("microchallenges", true);
    trackEvent("Microchallenge Started", { id });

    try {
      const res = await fetch(`/api/challenges/assign/${id}`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const errData = await res.json();
        if (errData.detail === "You already have an active challenge") {
          setAlreadyAssigned(true);
          notify(
            "⚡ You already have an active challenge. Track it in your dashboard.",
            "info"
          );
          return;
        }
        throw new Error(errData.detail || "Failed to start challenge");
      }

      notify("🎉 Microchallenge started successfully!", "success");
      router.push("/tools/microchallenges");
    } catch (err) {
      console.error("❌ Error starting challenge:", err);
      notify("Something went wrong while starting the challenge.", "error");
    } finally {
      setAssigning(false);
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!ready) return;
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (
      getUsage("microchallenges", true) >=
      (usageLimits.user.microchallenges || 0)
    ) {
      setShowMembership(true);
      return;
    }
    startChallenge();
  };

  if (!challenge) {
    return (
      <div className="my-6 p-4 border rounded-lg border-brand-dark shadow-sm">
        <p className="text-sm text-brand-dark">Loading challenge...</p>
      </div>
    );
  }

  return (
  <div className="my-6 p-4 rounded-lg shadow-sm border border-brand-accent bg-brand-teal/10">
    <div className="flex items-center gap-2 mb-2">
      <h3 className="text-lg font-semibold text-brand-accent">
        Ready for Microchallenge?
      </h3>
    

    {/* Explainer */}
    <p className="text-md text-brand-dark mb-3">
      A Microchallenge is a tiny, science-backed experiment for daily life.
      They’re not about discipline—they’re small nudges that work with your
      wiring. Think of them as playful tests of instinct: one small shift at a
      time, building awareness and momentum.
    </p>
</div>
    <p className="text-md text-brand-dark mb-3">
      <strong>{challenge.title}</strong>: {challenge.why}
    </p>

    {alreadyAssigned ? (
      <p className="text-sm text-gray-600">
        ⚡ You’ve already started this microchallenge.{" "}
        <button
          onClick={() => router.push("/tools/microchallenges")}
          className="text-brand-teal underline hover:text-brand-dark"
        >
          View progress in your dashboard →
        </button>
      </p>
    ) : (
      <button
        onClick={handleClick}
        data-cta="microchallenge-open"
        disabled={assigning}
        className={`text-sm font-semibold px-3 py-2 rounded-md border shadow-sm transition
          ${
            assigning
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "border-brand-accent text-brand-dark hover:bg-brand-teal hover:text-white"
          }`}
      >
        {assigning ? "Starting..." : "Try this Microchallenge"}
      </button>
    )}

    {/* Modals */}
    <MembershipModal
      isOpen={showMembership}
      onClose={() => setShowMembership(false)}
      disableEscape
    />
    <AuthModal
      isOpen={showAuth}
      onClose={() => setShowAuth(false)}
      context="start microchallenges"
      onSuccess={() => {
        setShowAuth(false);
        startChallenge();
      }}
      disableEscape
    />
  </div>
);

};

export default MicrochallengeBox;
