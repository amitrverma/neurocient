"use client";

import { useState } from "react";
import Link from "next/link";
import AuthModal from "@/app/components/AuthModal";
import type { ArticleAccessResult } from "./articleAccess";

type DeniedAccess = Exclude<ArticleAccessResult, { granted: true }>;

export default function InsightAccessGate({
  title,
  access,
}: {
  title: string;
  access: DeniedAccess;
}) {
  const [authOpen, setAuthOpen] = useState(false);
  const needsAuth = access.reason === "sign_in" || access.reason === "session";

  return (
    <main className="surface-page min-h-[70vh] px-5 py-16 md:py-24">
      <section className="mx-auto max-w-2xl rounded-3xl border border-brand-dark/10 bg-white p-7 shadow-sm md:p-10">
        <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-brand-teal">
          Insight access
        </p>
        <h1 className="mt-4 font-serif text-3xl text-brand-dark md:text-4xl">
          {title}
        </h1>
        <p className="mt-5 text-base leading-7 text-brand-dark/75">
          {access.message}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => window.location.reload()}
        context="continue reading Insights"
      />
    </main>
  );
}
