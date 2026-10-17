"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/app/components/AuthModal";
import { useAuth } from "@/app/context/AuthContext";
import CavemanScanResult from "../ScanResultStory";
import { restoreResultResponses } from "../scanResultSummary";
import {
  CAVEMAN_SCAN_STORAGE_KEY,
  type CavemanScanResponse,
} from "../scanStorage";

export default function CavemanScanResultPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [responses, setResponses] = useState<CavemanScanResponse[] | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CAVEMAN_SCAN_STORAGE_KEY);
      if (!saved) {
        router.replace("/diagnostics/caveman-scan");
        return;
      }
      const parsed: unknown = JSON.parse(saved);
      // A direct visit while taking the Scan must preserve the in-progress draft.
      if (parsed && typeof parsed === "object" && "stage" in parsed &&
          (parsed.stage === "intro" || parsed.stage === "questions")) {
        router.replace("/diagnostics/caveman-scan");
        return;
      }
      const restored = restoreResultResponses(parsed);
      if (!restored) {
        // Clear invalid completed state before redirecting; otherwise Scan sends
        // the same invalid state straight back to this page.
        window.localStorage.removeItem(CAVEMAN_SCAN_STORAGE_KEY);
        router.replace("/diagnostics/caveman-scan");
        return;
      }
      setResponses(restored);
    } catch {
      window.localStorage.removeItem(CAVEMAN_SCAN_STORAGE_KEY);
      router.replace("/diagnostics/caveman-scan");
    }
  }, [router]);

  if (!responses) {
    return (
      <main className="journey-loading">
        <p>Opening your result…</p>
      </main>
    );
  }

  return (
    <>
      <CavemanScanResult
        responses={responses}
        signedIn={Boolean(user)}
        ready={ready}
        onUnlock={() => {
          if (!ready) return;
          if (user) router.push("/my-caveman");
          else setShowAuth(true);
        }}
      />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false);
          router.push("/my-caveman");
        }}
        context="save your Inner Caveman portrait"
      />
    </>
  );
}
