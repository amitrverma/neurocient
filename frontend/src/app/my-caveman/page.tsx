"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { CavemanScanDetailedResult } from "@/app/diagnostics/caveman-scan/CavemanScanResult";
import {
  clearSavedPortraitMarker,
  loadLatestPortrait,
  saveCompletedPortrait,
} from "@/app/diagnostics/caveman-scan/scanPersistence";
import {
  CAVEMAN_SCAN_STORAGE_KEY,
  type CavemanScanResponse,
} from "@/app/diagnostics/caveman-scan/scanStorage";

export default function MyCavemanPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [responses, setResponses] = useState<CavemanScanResponse[] | null>(null);
  const [missing, setMissing] = useState(false);
  const [spots, setSpots] = useState<Array<{
    id: string;
    date: string;
    description: string;
    pattern?: string | null;
  }>>([]);
  const [spotsUnavailable, setSpotsUnavailable] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/diagnostics/caveman-scan");
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const local = window.localStorage.getItem(CAVEMAN_SCAN_STORAGE_KEY);
        if (local) {
          const parsed = JSON.parse(local) as { stage?: unknown; responses?: unknown };
          if (
            parsed.stage === "result" &&
            Array.isArray(parsed.responses) &&
            parsed.responses.length > 0
          ) {
            if (!cancelled) setResponses(parsed.responses as CavemanScanResponse[]);
            return;
          }
        }

        const latest = await loadLatestPortrait();
        if (!cancelled) {
          if (latest?.length) setResponses(latest);
          else setMissing(true);
        }
      } catch {
        if (!cancelled) setMissing(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [ready, router, user]);

  useEffect(() => {
    if (!user || !responses) return;
    void saveCompletedPortrait(
      responses,
      String(user.id ?? user.email ?? "account"),
    ).catch((error) => {
      console.error("Could not save Caveman Scan portrait", error);
    });
  }, [responses, user]);

  useEffect(() => {
    if (!user) return;
    void fetch("/api/spots", { credentials: "include" })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setSpots(data);
          setSpotsUnavailable(false);
        }
      })
      .catch(() => {
        setSpotsUnavailable(true);
      });
  }, [user]);

  if (!ready || (user && !responses && !missing)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f0] px-6 font-sans text-brand-dark/65">
        <p>Opening your portrait…</p>
      </main>
    );
  }

  if (!user) return null;

  if (missing || !responses) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f0] px-6 text-brand-dark">
        <div className="max-w-lg text-center">
          <h1 className="font-serif text-4xl font-bold">No completed portrait yet.</h1>
          <p className="mt-5 font-sans leading-7 text-brand-dark/68">
            Complete the twelve lived moments first. Your deeper portrait will
            be created from the Caveman moves that repeat across them.
          </p>
          <Link
            href="/diagnostics/caveman-scan"
            className="mt-7 inline-flex rounded-full bg-brand-primary px-6 py-3 font-sans text-sm font-semibold text-white"
          >
            Take the scan
          </Link>
        </div>
      </main>
    );
  }

  return (
    <CavemanScanDetailedResult
      responses={responses}
      spots={spots}
      spotsUnavailable={spotsUnavailable}
      onRetake={() => {
        window.localStorage.removeItem(CAVEMAN_SCAN_STORAGE_KEY);
        clearSavedPortraitMarker();
        router.push("/diagnostics/caveman-scan");
      }}
    />
  );
}
