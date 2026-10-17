"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import MyCavemanWorkspace from "./MyCavemanWorkspace";
import { restoreResultResponses } from "@/app/diagnostics/caveman-scan/scanResultSummary";
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
          const restored = restoreResultResponses(parsed);
          if (restored) {
            if (!cancelled) setResponses(restored);
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
    return () => { cancelled = true; };
  }, [ready, router, user]);

  useEffect(() => {
    if (!user || !responses) return;
    void saveCompletedPortrait(responses, String(user.id ?? user.email ?? "account")).catch((error) => {
      console.error("Could not save Inner Caveman Scan", error);
    });
  }, [responses, user]);

  if (!ready || (user && !responses && !missing)) {
    return <main className="journey-loading"><p>Opening My Inner Caveman…</p></main>;
  }

  if (!user) return null;

  if (missing || !responses) {
    return (
      <main className="surface-page caveman-scan-page flex min-h-[calc(100svh-4rem)] items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <h1 className="page-title">No completed Scan yet.</h1>
          <p className="mt-5 font-sans leading-7 text-brand-dark/68">
            Complete the twelve situations first. My Inner Caveman begins with the answers where you recognised an automatic response.
          </p>
          <Link href="/diagnostics/caveman-scan" className="mt-7 inline-flex rounded-full bg-brand-primary px-6 py-3 font-sans text-sm font-semibold text-white">
            Take the Scan
          </Link>
        </div>
      </main>
    );
  }

  return (
    <MyCavemanWorkspace
      responses={responses}
      onRetake={() => {
        window.localStorage.removeItem(CAVEMAN_SCAN_STORAGE_KEY);
        clearSavedPortraitMarker();
        router.push("/diagnostics/caveman-scan");
      }}
    />
  );
}
