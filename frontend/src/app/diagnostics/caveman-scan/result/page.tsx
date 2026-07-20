"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/app/components/AuthModal";
import { useAuth } from "@/app/context/AuthContext";
import CavemanScanResult from "../CavemanScanResult";
import { questionsBank } from "../questionsBank";
import { clearSavedPortraitMarker } from "../scanPersistence";
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
      const parsed = JSON.parse(saved) as { stage?: unknown; responses?: unknown };
      if (
        parsed.stage !== "result" ||
        !Array.isArray(parsed.responses) ||
        parsed.responses.length !== questionsBank.length
      ) {
        router.replace("/diagnostics/caveman-scan");
        return;
      }
      setResponses(parsed.responses as CavemanScanResponse[]);
    } catch {
      window.localStorage.removeItem(CAVEMAN_SCAN_STORAGE_KEY);
      router.replace("/diagnostics/caveman-scan");
    }
  }, [router]);

  if (!responses) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f6f0] px-6 font-sans text-brand-dark/65">
        <p>Opening your result…</p>
      </main>
    );
  }

  return (
    <>
      <CavemanScanResult
        responses={responses}
        onUnlock={() => {
          if (ready && user) router.push("/my-caveman");
          else setShowAuth(true);
        }}
        onRestart={() => {
          window.localStorage.removeItem(CAVEMAN_SCAN_STORAGE_KEY);
          clearSavedPortraitMarker();
          router.push("/diagnostics/caveman-scan");
        }}
      />
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false);
          router.push("/my-caveman");
        }}
        context="open your deeper Caveman portrait"
      />
    </>
  );
}
