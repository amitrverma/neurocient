"use client";

import { useState } from "react";
import { PenLine, Plus } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../AuthModal";
import { useNotification } from "../NotificationProvider";
import MembershipModal from "../MembershipModal";
import { getUsage, incrementUsage, usageLimits } from "../../utils/usage";
import { trackEvent } from "../../utils/analytics";

interface CavemanSpotProps {
  prompt?: string;
  onAdded?: (spot: { date: string; description: string }) => void;
}

const CavemanSpot = ({
  prompt = "Notice a caveman instinct? Log it here.",
  onAdded,
}: CavemanSpotProps) => {
  const [note, setNote] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [showMembership, setShowMembership] = useState(false);

  const { user, ready } = useAuth();
  const { notify } = useNotification();

  const handleSubmit = async () => {
    if (!ready) return;
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (!note.trim()) {
      notify("Please write something before adding a spot", "info");
      return;
    }

    if (getUsage("spots", true) >= (usageLimits.user.spots || 0)) {
      setShowMembership(true);
      return;
    }

    try {
      const res = await fetch("/api/spots/", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: note,
        }),
      });

      if (res.ok) {
        incrementUsage("spots", true);
        notify("Spot saved", "success");
        onAdded?.({ date: new Date().toISOString(), description: note });
        setNote("");
        trackEvent("Spot Added");
      } else {
        const data = await res.json();
        notify(data.detail || "Failed to log spot", "error");
      }
    } catch (err) {
      console.error("Error saving spot:", err);
      notify("Something went wrong", "error");
    }
  };

  return (
  <aside className="not-prose my-2 rounded-lg border border-brand-accent bg-white px-4 py-3 text-brand-dark">
    <div className="flex items-center">
      <h3 className="font-sans text-brand-accent">
        Caveman Spot
      </h3>
    </div>

    <p className="mt-3 font-sans text-sm leading-6 text-brand-dark/75">
      A spot is a short observation. Use it to name where this idea shows up
      in real life so the pattern becomes easier to recognize next time.
    </p>

    <p className="mt-3 rounded-md border border-brand-accent/28 bg-brand-accent/[0.03] px-3 py-2 font-serif text-[1.02rem] leading-6 text-brand-dark">
      {prompt}
    </p>

    <div className="mt-3 flex items-start gap-2.5">
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor="caveman-spot-note">
          Add your observation
        </label>
        <textarea
          id="caveman-spot-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add your observation..."
          rows={2}
          className="block w-full resize-y rounded-md border border-brand-accent/30 bg-white px-3 py-2 font-sans text-sm leading-5 text-brand-dark transition placeholder:text-brand-dark/40 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/15"
        />
      </div>

        <button
          type="button"
          onClick={handleSubmit}
          data-cta="add-spot"
          disabled={!ready}
          className="mt-0.5 inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-brand-accent/40 px-3.5 py-1.5 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-brand-accent transition hover:border-brand-accent hover:bg-brand-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Log It
      </button>
    </div>

    <MembershipModal
      isOpen={showMembership}
      onClose={() => setShowMembership(false)}
      disableEscape
    />
    <AuthModal
      isOpen={showAuth}
      onClose={() => setShowAuth(false)}
      context="start spotting your caveman"
      disableEscape
    />
  </aside>
);
};

export default CavemanSpot;
