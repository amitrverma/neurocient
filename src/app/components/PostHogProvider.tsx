"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackEvent } from "../utils/analytics";

const PostHogProvider = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route changes
  useEffect(() => {
    trackEvent("Page Viewed", { pathname, search: searchParams.toString() });
    if (typeof window !== "undefined" && window.posthog?.capture) {
      window.posthog.capture("$pageview");
    }
  }, [pathname, searchParams]);

  // Global listener for CTA clicks using data-cta attribute
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-cta]") as HTMLElement | null;
      if (target) {
        const cta = target.getAttribute("data-cta") || "unknown";
        trackEvent("CTA Clicked", { cta });
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return null;
};

export default PostHogProvider;
