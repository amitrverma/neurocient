"use client";

import { useCallback, useEffect, useState } from "react";
import type { WorkOverview } from "./accountOverview";

const initialOverview: WorkOverview = {
  status: "loading",
  savedCount: 0,
  spotCount: 0,
  challengeCount: 0,
  activeChallenge: false,
  hasPractice: false,
  savedArticles: [],
  latestSpot: null,
  activeChallengeTitle: null,
  activeChallengeLoggedToday: false,
  practice: null,
};

const readJson = async (url: string) => {
  const response = await fetch(url, {
    credentials: "include",
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
};

export default function useWorkOverview(active: boolean) {
  const [overview, setOverview] = useState<WorkOverview>(initialOverview);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!active) return;
    let mounted = true;

    const load = async () => {
      setOverview((current) => ({ ...current, status: "loading" }));
      const results = await Promise.allSettled([
        readJson("/api/articles/saved"),
        readJson("/api/spots"),
        readJson("/api/challenges/my"),
        readJson("/api/practice/loops"),
      ]);
      if (!mounted) return;
      if (results.some((result) => result.status === "rejected")) {
        setOverview((current) => ({ ...current, status: "unavailable" }));
        return;
      }

      const [saved, spots, challenges, practice] = results.map(
        (result) => result.status === "fulfilled" ? result.value : null,
      );
      const assigned = Array.isArray(challenges) ? challenges : [];
      const savedArticles = Array.isArray(saved?.saved) ? saved.saved : [];
      const spotEntries = Array.isArray(spots) ? spots : [];
      const activeChallenge = assigned.find((challenge) => challenge.status === "active");

      setOverview({
        status: "ready",
        savedCount: savedArticles.length,
        spotCount: spotEntries.length,
        challengeCount: assigned.length,
        activeChallenge: Boolean(activeChallenge),
        hasPractice: Boolean(practice?.id),
        savedArticles,
        latestSpot: spotEntries[0] ?? null,
        activeChallengeTitle: activeChallenge?.title ?? null,
        activeChallengeLoggedToday: Boolean(
          activeChallenge?.logged_today ?? activeChallenge?.loggedToday,
        ),
        practice: practice?.id ? practice : null,
      });
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [active, reloadKey]);

  const retry = useCallback(() => setReloadKey((value) => value + 1), []);

  return { overview, retry };
}
