"use client";

import { useEffect } from "react";
import { trackEvent } from "../utils/analytics";

export default function SubscribePage() {
  useEffect(() => {
    trackEvent("Paid Upgrade");
  }, []);

  return (
    <main className="prose mx-auto p-6 text-center">
      <h1>Subscribe</h1>
      <p>Subscriptions are coming soon. Please check back later.</p>
    </main>
  );
}
