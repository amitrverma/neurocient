// app/components/Newsletter.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { trackEvent } from "../utils/analytics";

interface NewsletterProps {
  subtext?: string;
  logoSrc?: string;
  variant?: "compact" | "feature";
}

const Newsletter = ({
  subtext = "Weekly insights to help you outsmart your inner caveman.",
  logoSrc = "/logo/newsletter.png",
  variant = "compact",
}: NewsletterProps) => {
  const [email, setEmail] = useState("");
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "subscribed">("idle");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("subscribedEmail");
      if (stored) {
        setSubscribedEmail(stored);
        setStatus("subscribed");
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (data.status === "subscribed" || data.status === "already_subscribed") {
        localStorage.setItem("subscribedEmail", email);
        setSubscribedEmail(email);
        setStatus("subscribed");
        trackEvent("Newsletter Signup");
      }
    } catch (err) {
      console.error("Subscription failed:", err);
    }
    setEmail("");
  };

  if (variant === "feature") {
    return (
      <section className="w-full bg-brand-dark px-6 py-14 text-white md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[0.42fr_0.58fr]">
          {logoSrc && (
            <div className="flex justify-center md:justify-start">
              <Image
                src={logoSrc}
                alt="Neurocient Labs Newsletter - Mind the Gap"
                width={360}
                height={360}
                className="h-48 w-48 object-contain md:h-[22rem] md:w-[22rem]"
              />
            </div>
          )}

          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              Weekly Insights
            </p>
            <h2 className="mt-5 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
              One email. One{" "}
              <span className="italic text-brand-secondary">
                caveman pattern.
              </span>
              <br />
              Every week.
            </h2>
            <p className="mt-7 max-w-3xl font-sans text-base font-medium leading-8 text-white/90 md:text-lg">
              {subtext}
            </p>

            {status === "idle" ? (
              <form
                onSubmit={handleSubmit}
                className="mt-10 flex w-full max-w-xl flex-col sm:flex-row"
              >
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-12 flex-1 bg-white px-5 py-4 font-sans text-sm font-medium text-brand-dark placeholder:text-brand-dark/45 outline-none ring-1 ring-transparent focus:ring-brand-secondary/70"
                />
                <button
                  type="submit"
                  data-cta="newsletter-join"
                  className="min-h-12 bg-white px-8 py-4 font-sans text-sm font-bold uppercase tracking-[0.04em] text-brand-dark transition hover:text-brand-primary"
                >
                  Join Free
                </button>
              </form>
            ) : (
              <div className="mt-10 flex flex-col items-center gap-3 md:items-start">
                <p className="font-sans text-lg font-semibold text-white">
                  Subscribed as <span>{subscribedEmail}</span>
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="border border-white/45 px-4 py-2 font-sans text-sm font-semibold text-white transition hover:bg-white hover:text-brand-dark"
                >
                  Subscribe with another email
                </button>
              </div>
            )}

            <p className="mt-6 font-sans text-base font-medium leading-7 text-white/90">
              No spam. Unsubscribe anytime. Read by 4,000+ modern cavemen.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 rounded-xl border p-6 md:flex-row">
      {logoSrc && (
        <Image
          src={logoSrc}
          alt="Neurocient Labs Newsletter - Inner Caveman insights"
          width={150}
          height={150}
          className="shrink-0 object-contain"
        />
      )}

      <div className="flex w-full flex-col items-center gap-4 md:items-start">
        <p className="text-center text-2xl font-semibold text-brand-dark md:text-left">
          {subtext}
        </p>

        {status === "idle" ? (
          <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-lg border px-3 py-2 font-bold text-brand-dark"
            />
            <button
              type="submit"
              data-cta="newsletter-join"
              className="rounded-lg border px-4 py-2 font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
            >
              Join
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-2 md:items-start">
            <p className="text-xl font-medium text-brand-accent">
              Subscribed as <span className="font-semibold">{subscribedEmail}</span>
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="rounded-lg border px-3 py-1 text-sm font-semibold text-brand-dark transition hover:border-brand-teal hover:text-brand-teal"
            >
              Subscribe with another email
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Newsletter;
