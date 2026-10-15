"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { trackEvent } from "../utils/analytics";

export default function SubscribePage() {
  useEffect(() => {
    trackEvent("Paid Upgrade");
  }, []);

  return (
    <main className="surface-page">
      <section className="surface-hero utility-hero">
        <div>
          <p className="surface-eyebrow">Subscribe</p>
          <h1 className="surface-title">
            Membership
            <span>is coming soon.</span>
          </h1>
        </div>

        <aside className="utility-hero-card">
          <Mail className="h-7 w-7 text-brand-accent" />
          <p className="mt-5 font-sans text-base leading-8 text-brand-dark/72">
            Paid subscriptions are not open yet. For now, use the free guides,
            diagnostics, and tools while the membership layer is being prepared.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/insights"
              className="inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary"
            >
              Explore insights
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
            >
              Contact us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </section>
    </main>
  );
}
