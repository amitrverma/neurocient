"use client";

import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../AuthModal";
import MembershipModal from "../MembershipModal";
import { getUsage, incrementUsage, usageLimits } from "../../utils/usage";
import { trackEvent } from "../../utils/analytics";
import { useNotification } from "../NotificationProvider";

interface MicrochallengeBoxProps {
  id: string;
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
  const [assigning, setAssigning] = useState(false);
  const [alreadyAssigned, setAlreadyAssigned] = useState(false);

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

    if (id) fetchChallenge();
  }, [id]);

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
            "You already have an active challenge. Track it in your dashboard.",
            "info"
          );
          return;
        }
        throw new Error(errData.detail || "Failed to start challenge");
      }

      notify("Microchallenge started successfully", "success");
      router.push("/tools/microchallenges");
    } catch (err) {
      console.error("Error starting challenge:", err);
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
      <aside className="not-prose my-8 rounded-lg border border-brand-teal/45 bg-white px-3 pt-0.5 pb-3 text-brand-dark md:px-4 md:pt-0.5 md:pb-3">
        <div className="flex items-center gap-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-brand-teal">
          <span className="h-px w-6 bg-brand-dark/60" />
          <span>Loading microchallenge</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="not-prose my-8 rounded-lg border border-brand-teal bg-white px-3 pt-0.5 pb-3 text-brand-dark md:px-4 md:pt-0.5 md:pb-3">
      <div className="flex items-center gap-2">
        <h3 className="font-sans text-[0.72rem] font-semibold uppercase leading-none tracking-[0.18em] text-brand-teal">
          Microchallenge
        </h3>
      </div>

      <p className="mt-1 font-sans text-sm leading-6 text-brand-dark/75">
        A microchallenge is a small behavior experiment. It helps you test the
        article&apos;s idea in daily life instead of leaving it as insight alone.
      </p>

      <div className="mt-2.5 rounded-md border border-brand-teal/30 bg-brand-teal/[0.04] px-3 py-2.5">
        <p className="font-sans text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-brand-teal">
          Featured challenge
        </p>
        <p className="mt-1 font-serif text-[1.02rem] leading-7 text-brand-dark">
          <strong className="font-bold text-brand-dark">{challenge.title}</strong>
        </p>
        <p className="mt-1 font-sans text-sm leading-6 text-brand-dark/72">
          {challenge.why}
        </p>
      </div>

      <div className="mt-2.5 flex items-center justify-between gap-3">
        <p className="font-sans text-sm leading-6 text-brand-dark/68">
          Keep it small enough to do today.
        </p>

        {alreadyAssigned ? (
          <button
            type="button"
            onClick={() => router.push("/tools/microchallenges")}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-brand-teal/40 px-3.5 py-1.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand-teal transition hover:border-brand-teal hover:bg-brand-teal hover:text-white"
          >
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            View Progress
          </button>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            data-cta="microchallenge-open"
            disabled={assigning || !ready}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-brand-teal/45 px-3.5 py-1.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand-teal transition hover:border-brand-teal hover:bg-brand-teal hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {assigning ? "Starting..." : "Try this Microchallenge"}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

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
    </aside>
  );
};

export default MicrochallengeBox;
