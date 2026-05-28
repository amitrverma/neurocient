"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import CavemanScanResult from "../CavemanScanResult";
import AuthModal from "@/app/components/AuthModal";
import { useAuth } from "@/app/context/AuthContext";
import {
  CAVEMAN_SCAN_STORAGE_KEY,
  type CavemanScanState,
} from "../scanStorage";

export default function CavemanScanResultPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [scanState, setScanState] = useState<CavemanScanState | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CAVEMAN_SCAN_STORAGE_KEY);
      if (!saved) {
        router.replace("/diagnostics/caveman-scan");
        return;
      }

      const parsed = JSON.parse(saved) as CavemanScanState;
      if (parsed.stage !== "result" || !Array.isArray(parsed.responses)) {
        router.replace("/diagnostics/caveman-scan");
        return;
      }

      setScanState(parsed);
    } catch {
      window.localStorage.removeItem(CAVEMAN_SCAN_STORAGE_KEY);
      router.replace("/diagnostics/caveman-scan");
    } finally {
      setHasChecked(true);
    }
  }, [router]);

  const handleRestart = () => {
    window.localStorage.removeItem(CAVEMAN_SCAN_STORAGE_KEY);
    router.replace("/diagnostics/caveman-scan");
  };

  if (!hasChecked || !scanState || !ready) return <ResultLoader />;

  if (!user) {
    return (
      <>
        <ResultLoader />
        <AuthModal
          isOpen
          onClose={() => {}}
          context="see your scan result"
          disableEscape
        />
      </>
    );
  }

  return (
    <CavemanScanResult
      responses={scanState.responses}
      onRestart={handleRestart}
    />
  );
}

const ResultLoader = () => (
  <main className="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-white px-6 font-serif text-brand-dark">
    <div className="w-full max-w-md rounded-lg border border-brand-dark/12 bg-white p-7 text-center shadow-[0_20px_60px_rgba(4,42,43,0.06)]">
      <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-brand-accent" />
      <p className="mt-5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
        Inner Caveman Scan
      </p>
      <h1 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
        Preparing your result
      </h1>
      <p className="mt-3 font-sans text-sm leading-7 text-brand-dark/72">
        Reading your saved scan and rebuilding the snapshot.
      </p>
    </div>
  </main>
);
