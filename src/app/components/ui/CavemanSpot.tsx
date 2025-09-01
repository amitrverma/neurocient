"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../AuthModal";
import { useNotification } from "../NotificationProvider";
import MembershipModal from "../MembershipModal";
import { getUsage, incrementUsage, usageLimits } from "../../utils/usage";
import { trackEvent } from "../../utils/analytics";

interface CavemanSpotProps {
  prompt?: string; // now optional
  onAdded?: (spot: { date: string; description: string }) => void;
}

const CavemanSpot = ({
  prompt = "Notice a caveman instinct? Log it here 👇",
  onAdded,
}: CavemanSpotProps) => {
  const [note, setNote] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [showMembership, setShowMembership] = useState(false);

  const { user } = useAuth();
  const { notify } = useNotification();

  const handleSubmit = async () => {
    if (!user) {
      setShowAuth(true); // ✅ prompt login only when adding
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
      const res = await fetch("/api/spots", {
        method: "POST",
        credentials: "include", // ✅ send cookies for auth
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: note,
        }),
      });

      if (res.ok) {
        incrementUsage("spots", true);
        notify("✅ Spot saved!", "success");
        onAdded?.({ date: new Date().toISOString(), description: note });
        setNote("");
        trackEvent("Spot Added");
      } else {
        const data = await res.json();
        notify(data.detail || "Failed to log spot", "error");
      }
    } catch (err) {
      console.error("❌ Error saving spot:", err);
      notify("Something went wrong", "error");
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white shadow-sm mb-4">
      <h3>Spot Your Inner Caveman</h3>
      <p className="text-sm">
        Notice the moments when your inner caveman shows up in modern life. By
        naming these patterns, you build awareness and start steering with your
        wiring instead of against it.
      </p>
      <p className="text-md text-brand-dark mb-2">{prompt}</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add your observation..."
        rows={2}
        className="w-full text-sm border rounded-md p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <button
        onClick={handleSubmit}
        data-cta="add-spot"
        className="text-sm font-semibold px-3 py-2 rounded-md border text-brand-dark hover:bg-brand-teal hover:text-white transition"
      >
        Log It
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

export default CavemanSpot;
