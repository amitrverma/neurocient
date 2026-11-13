"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../AuthModal";
import { useNotification } from "../NotificationProvider";
import MembershipModal from "../MembershipModal";
import {
  getUsage,
  hasActiveMembership,
  incrementUsage,
  usageLimits,
} from "../../utils/usage";
import { trackEvent } from "../../utils/analytics";

interface CavemanSpotProps {
  prompt?: string;
  onAdded?: (spot: { date: string; description: string }) => void;
  compact?: boolean;
}

const CavemanSpot = ({
  prompt = "Notice the response in a real situation? Record it here.",
  onAdded,
  compact = false,
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

    if (
      !hasActiveMembership(user) &&
      getUsage("spots", true) >= (usageLimits.user.spots || 0)
    ) {
      setShowMembership(true);
      return;
    }

    try {
      const res = await fetch("/api/spots", {
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
        if (!hasActiveMembership(user)) incrementUsage("spots", true);
        notify("Spot saved", "success");
        onAdded?.({ date: new Date().toISOString(), description: note });
        setNote("");
        trackEvent("Spot Added");
      } else {
        const data = await res.json();
        if (res.status === 402 || data?.detail?.code === "membership_required") {
          setShowMembership(true);
          return;
        }
        notify(data?.detail?.message || data.detail || "Failed to log spot", "error");
      }
    } catch (err) {
      console.error("Error saving spot:", err);
      notify("Something went wrong", "error");
    }
  };

  return (
  <aside
    role="region"
    aria-label={compact ? "Record a spot" : "Spot the Inner Caveman"}
    className={`not-prose text-brand-dark ${
      compact
        ? "bg-transparent"
        : "my-2 rounded-lg border border-brand-accent bg-white px-4 py-3"
    }`}
  >
    <div className="flex items-center">
      <h3 className={compact ? "text-2xl font-bold leading-tight text-brand-dark" : "font-sans text-brand-accent"}>
        {compact ? "What did you notice?" : "Spot the Inner Caveman"}
      </h3>
    </div>

    {!compact ? (
      <p className="mt-3 font-sans text-sm leading-6 text-brand-dark/75">
        A spot is a short observation. Use it to name where this idea shows up
        in real life so the pattern becomes easier to recognize next time.
      </p>
    ) : null}

    <p className={`mt-3 font-sans text-sm leading-6 text-brand-dark/72 ${
      compact ? "" : "rounded-md border border-brand-accent/28 bg-brand-accent/[0.03] px-3 py-2 font-serif text-[1.02rem]"
    }`}>
      {prompt}
    </p>

    <div className="mt-4 grid gap-3 sm:flex sm:items-start">
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
          className={`inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full font-sans font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            compact
              ? "bg-brand-dark px-5 py-2.5 text-sm text-white hover:bg-brand-primary"
              : "border border-brand-accent/40 px-3.5 py-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-brand-accent hover:border-brand-accent hover:bg-brand-accent hover:text-white"
          }`}
        >
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
        Log it
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
      context="save this real-life observation"
      disableEscape
    />
  </aside>
);
};

export default CavemanSpot;
