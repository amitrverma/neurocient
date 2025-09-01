"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { trackEvent } from "../utils/analytics";

export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 🔹 Initialize PostHog once on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !posthog.__loaded) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        persistence: "localStorage+cookie",
        person_profiles: "identified_only",
      });
      (posthog as any).__loaded = true; // avoid re-init on hot reload
    }
  }, []);

  // 🔹 Track pageviews when route changes
  useEffect(() => {
    if (!pathname) return;
    const search = typeof window !== "undefined" ? window.location.search : "";
    trackEvent("Page Viewed", { pathname, search });
    posthog.capture("$pageview");
  }, [pathname]);

  // 🔹 Track CTA clicks (elements with data-cta attr)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-cta]") as HTMLElement | null;
      if (target) {
        const cta = target.getAttribute("data-cta") || "unknown";
        trackEvent("CTA Clicked", { cta });
        posthog.capture("CTA Clicked", { cta });
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return <>{children}</>;
}
