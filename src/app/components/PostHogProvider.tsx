"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "../utils/analytics";

const PostHogProvider = () => {
  const pathname = usePathname();

  // Track page views on route changes
  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    trackEvent("Page Viewed", { pathname, search });
    if (typeof window !== "undefined" && window.posthog?.capture) {
      window.posthog.capture("$pageview");
    }
  }, [pathname]);

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
