"use client";

import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useNotification } from "../NotificationProvider";

interface CavemanSpotProps {
  prompt?: string;  // now optional, we’ll add a default
  onAuthRequired?: () => void;
  onAdded?: (spot: { date: string; description: string }) => void;
}

const CavemanSpot = ({
  prompt = "Notice a caveman instinct? Log it here 👇",
  onAuthRequired,
  onAdded,
}: CavemanSpotProps) => {
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { token } = useAuth();
  const { notify } = useNotification();

  const handleSubmit = async () => {
    if (!token) {
      onAuthRequired?.();
      return;
    }
    if (!note.trim()) {
      notify("Please write something before adding a spot", "info");
      return;
    }

    try {
      const res = await fetch("/api/spots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ note, prompt }),
      });

      if (res.ok) {
        notify("✅ Spot saved!", "success");
        setSubmitted(true);

        // call parent update
        onAdded?.({ date: new Date().toISOString(), description: note });

        setNote("");
        setTimeout(() => setSubmitted(false), 1500); // reset after feedback
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
    <div className="p-4 border rounded-lg bg-white shadow-sm mb-4">
      <p className="text-sm text-gray-800 mb-2">{prompt}</p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a new spot..."
        rows={2}
        className="w-full text-sm border rounded-md p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />
      <button
        onClick={handleSubmit}
        className="text-xs font-semibold px-3 py-2 rounded-md bg-yellow-300 text-gray-800 hover:bg-yellow-400 transition"
      >
        Add Spot →
      </button>

      {submitted && (
        <p className="mt-2 text-sm text-green-700 font-medium">✅ Spot logged!</p>
      )}
    </div>
  );
};

export default CavemanSpot;
