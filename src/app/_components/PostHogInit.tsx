"use client";

import { useEffect } from "react";
import posthog from "posthog-js";

const PostHogInit = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
        persistence: "localStorage+cookie", // best for logged-in flows
        defaults: '2025-05-24',
        person_profiles: "identified_only", // only when user logs in
      });
    }
  }, []);

  return null;
};

export default PostHogInit;
