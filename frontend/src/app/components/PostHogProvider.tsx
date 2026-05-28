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

  // 🔹 Track CTA clicks, generic button/link clicks
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // CTA elements explicitly tagged
      const ctaTarget = target.closest("[data-cta]") as HTMLElement | null;
      if (ctaTarget) {
        const cta = ctaTarget.getAttribute("data-cta") || "unknown";
        trackEvent("CTA Clicked", { cta });
        posthog.capture("CTA Clicked", { cta });
      }

      // Generic button tracking
      const button = target.closest("button");
      if (button) {
        const label =
          button.getAttribute("aria-label") || button.textContent?.trim() || "unknown";
        trackEvent("Button Clicked", { label });
        posthog.capture("Button Clicked", { label });
      }

      // Generic link tracking
      const link = target.closest("a");
      if (link) {
        const href = link.getAttribute("href") || "";
        const label = link.textContent?.trim() || href || "unknown";
        trackEvent("Link Clicked", { href, label });
        posthog.capture("Link Clicked", { href, label });
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // 🔹 Track form submissions
  useEffect(() => {
    const handleSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement;
      const formName =
        form.getAttribute("name") ||
        form.getAttribute("id") ||
        form.getAttribute("action") ||
        "unknown";
      trackEvent("Form Submitted", { form: formName });
      posthog.capture("Form Submitted", { form: formName });
    };

    document.addEventListener("submit", handleSubmit);
    return () => document.removeEventListener("submit", handleSubmit);
  }, []);

  return <>{children}</>;
}
