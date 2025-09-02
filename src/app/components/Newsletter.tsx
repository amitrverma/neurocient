// app/components/Newsletter.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { trackEvent } from "../utils/analytics";

interface NewsletterProps {
  subtext?: string;
  logoSrc?: string;
}

const Newsletter = ({
  subtext = "Weekly insights to help you outsmart your inner caveman.",
  logoSrc = "/logo/newsletter.png",
}: NewsletterProps) => {
  const [email, setEmail] = useState("");
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "subscribed">("idle");

  // ✅ Check localStorage on mount
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
      console.error("❌ Subscription failed:", err);
    }
    setEmail("");
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto p-6 border rounded-xl">
      {/* Logo */}
      {logoSrc && (
        <Image
          src={logoSrc}
          alt="Mind The Gap Logo"
          width={150}
          height={150}
          className="object-contain flex-shrink-0"
        />
      )}

      {/* Text + Form or Thank You */}
      <div className="flex flex-col items-center md:items-start gap-4 w-full">
        <p className="text-2xl text-brand-dark font-semibold text-center md:text-left">
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
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-teal text-background font-bold"
            />
            <button
              type="submit"
              data-cta="newsletter-join"
              className="px-4 py-2 rounded-lg border text-brand-dark font-semibold hover:bg-brand-primary hover:text-white transition"
            >
              Join
            </button>
          </form>
        ) : (
          <div className="flex flex-col items-center md:items-start gap-2">
            <p className="text-xl text-brand-accent font-medium">
              Subscribed as <span className="font-semibold">{subscribedEmail}</span>
            </p>
            <button
              onClick={() => setStatus("idle")}
              className="text-sm font-semibold px-3 py-1 rounded-lg border text-brand-dark hover:bg-brand-teal hover:text-white transition"
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
