"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import CavemanSpot from "../../components/ui/CavemanSpot";

interface Spot {
  date: string;
  description: string;
}

const SpotsPage = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    const fetchSpots = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/spots", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch spots: ${res.statusText}`);
        }

        const data = await res.json();
        setSpots(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpots();
  }, [token]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#042a2b] mb-6">
        Caveman Spotting
      </h1>

      <p className="text-gray-600 mb-6">
        Here you’ll see all the spots you’ve logged, and you can add new ones anytime.
      </p>

      {/* Add new spot box */}
      <CavemanSpot
        prompt="Notice a caveman instinct? Log it here 👇"
        onAdded={(spot) => setSpots((prev) => [...prev, spot])}
      />

      {loading ? (
        <p className="text-gray-500">Loading spots...</p>
      ) : !token ? (
        <div className="text-center text-gray-500 p-6">
          Please{" "}
          <button
            onClick={() => setShowAuth(true)}
            className="text-[#5eb1bf] font-semibold hover:underline"
          >
            log in
          </button>{" "}
          to view your Caveman Spots.
        </div>
      ) : spots.length === 0 ? (
        <p className="text-gray-500">No spots logged yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded-lg">
          {spots.map((s, i) => (
            <li key={i} className="p-4">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(s.date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <p className="text-sm text-[#042a2b]">{s.description}</p>
            </li>
          ))}
        </ul>
      )}

      {/* After spots list */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold text-[#042a2b] mb-3">
          Related Insights
        </h2>
        <ul className="space-y-2">
          <li>
            <Link
              href="/insights/why-we-avoid-conflict"
              className="text-sm text-[#5eb1bf] hover:underline"
            >
              Why We Avoid Conflict (and how to reframe it)
            </Link>
          </li>
          <li>
            <Link
              href="/insights/the-hidden-cost-of-procrastination"
              className="text-sm text-[#5eb1bf] hover:underline"
            >
              The Hidden Cost of Procrastination
            </Link>
          </li>
        </ul>
      </section>

      <div className="mt-6">
        <Link
          href="/tools"
          className="text-sm font-semibold text-[#042a2b] hover:text-[#5eb1bf] underline"
        >
          ← Back to Tools Dashboard
        </Link>
      </div>
    </div>
  );
};

export default SpotsPage;
