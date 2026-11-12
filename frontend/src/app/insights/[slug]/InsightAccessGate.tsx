"use client";

import { type ReactNode, useState } from "react";
import Link from "next/link";
import AuthModal from "@/app/components/AuthModal";
import type { ArticleAccessResult } from "./articleAccess";

type DeniedAccess = Exclude<ArticleAccessResult, { granted: true }>;

export default function InsightAccessGate({
  title,
  date,
  excerpt,
  author,
  typographyVariant,
  publicLead,
  access,
}: {
  title: string;
  date: string;
  excerpt?: string;
  author: string;
  typographyVariant: string;
  publicLead: ReactNode;
  access: DeniedAccess;
}) {
  const [authOpen, setAuthOpen] = useState(false);
  const needsAuth = access.reason === "sign_in" || access.reason === "session";

  return (
    <main className="relative">
      <article
        className={`article-shell ${
          typographyVariant === "prologue" ? "article-shell-premium" : ""
        }`}
      >
        <div className="article-hero-kicker">
          <span>Neurocient Insight</span>
          <span className="h-px flex-1 bg-brand-dark/15" />
        </div>

        <h1 className="article-title">{title}</h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-sm font-medium text-brand-dark/70">
          <span>{date}</span>
          <span>{author}</span>
        </div>
        {excerpt && <p className="article-deck">{excerpt}</p>}
        <div className="article-lead-separator" aria-hidden="true" />

        <div className="article-reader-grid">
          <div aria-hidden="true" />
          <div className="article-content-column">
            <div
              className={`prose prose-article prose-variant-${typographyVariant} public-insight-lead max-w-none`}
            >
              {publicLead}
            </div>

            <section className="mt-10 border-t border-brand-dark/15 pt-8">
              <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-brand-teal">
                Continue reading
              </p>
              <p className="mt-4 text-base leading-7 text-brand-dark/75">
                {access.message}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {needsAuth ? (
                  <button
                    type="button"
                    onClick={() => setAuthOpen(true)}
                    className="min-h-12 rounded-full bg-brand-teal px-6 font-sans text-sm font-semibold text-white"
                  >
                    Sign in or create an account
                  </button>
                ) : access.reason === "membership" ? (
                  <Link
                    href="/membership"
                    className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-teal px-6 font-sans text-sm font-semibold text-white"
                  >
                    Explore Membership
                  </Link>
                ) : null}
                <Link
                  href="/insights"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-dark/15 px-6 font-sans text-sm font-semibold text-brand-dark"
                >
                  Browse Insights
                </Link>
              </div>
            </section>
          </div>
        </div>
      </article>
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => window.location.reload()}
        context="continue reading Insights"
      />
    </main>
  );
}
