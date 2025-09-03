"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import CavemanSpot from "../../components/ui/CavemanSpot";
import MembershipModal from "../../components/MembershipModal";
import AuthModal from "../../components/AuthModal";
import { usageLimits } from "../../utils/usage";

interface Spot {
  date: string;
  description: string;
}

const SpotsPage = () => {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showMembership, setShowMembership] = useState(false);

   const { user, ready } = useAuth();

  useEffect(() => {
    const fetchSpots = async () => {
      if (!ready) return;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/spots", {
         method: "GET",
          credentials: "include", // 👈 send cookies
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
  }, [user]);

  const userLimit = usageLimits.user.spots || 0;
  const hasReachedLimit = user && spots.length >= userLimit;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#042a2b] mb-6">
        Caveman Spotting
      </h1>

      <p className="text-brand-dark mb-6">
        Here you’ll see all the spots you’ve logged, and you can add new ones anytime.
      </p>

      {/* Add new spot box */}
      {user && !hasReachedLimit && (
        <CavemanSpot
          prompt="Notice a caveman instinct? Log it here 👇"
          onAdded={(spot) => setSpots((prev) => [...prev, spot])}
        />
      )}

      {/* Show membership prompt if limit reached */}
      {hasReachedLimit && (
        <div className="p-4 border rounded-lg bg-yellow-50 text-center text-md text-brand-dark">
          <p className="mb-2">
            You’ve reached your free limit of {userLimit} spots.
          </p>
<Link
  href="/membership"
  className="px-4 py-2 border text-brand-dark rounded-md hover:bg-brand-primary hover:text-white transition"
>
  Become a Member
</Link>
        </div>
      )}

      {loading ? (
        <p className="text-brand-dark">Loading spots...</p>
      ) : !user ? (
        <div className="text-center text-brand-dark p-6">
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
        <p className="text-brand-dark">No spots logged yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200 bg-white rounded-lg">
          {spots.map((s, i) => (
            <li key={i} className="p-4">
              <div className="text-xs text-brand-dark mb-1">
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

      {/* Membership Modal */}
      <MembershipModal
        isOpen={showMembership}
        onClose={() => setShowMembership(false)}
        disableEscape
      />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        context="start spotting your caveman"
      />
    </div>
  );
};

export default SpotsPage;