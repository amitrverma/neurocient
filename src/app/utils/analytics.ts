"use client";

// Basic wrapper around PostHog capture for safe client-side usage
export const trackEvent = (
  event: string,
  properties?: Record<string, unknown>
) => {
  if (typeof window !== "undefined" && window.posthog?.capture) {
    window.posthog.capture(event, properties);
  }
};

export default trackEvent;
