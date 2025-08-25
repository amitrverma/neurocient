// app/components/Newsletter.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface NewsletterProps {
  subtext?: string;
  logoSrc?: string;
}

const Newsletter = ({
  subtext = "Weekly insights to help you outsmart your inner caveman.",
  logoSrc = "/logo/newsletter.png",
}: NewsletterProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "subscribed">("idle");

  // ✅ Check localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("subscribed") === "true") {
      setStatus("subscribed");
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
        localStorage.setItem("subscribed", "true");
        setStatus("subscribed");
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
        <p className="text-2xl text-brand-teal font-semibold text-center md:text-left">
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
              className="px-4 py-2 rounded-lg bg-brand-secondary text-brand-dark font-semibold hover:bg-brand-primary hover:text-background transition"
            >
              Join
            </button>
          </form>
        ) : (
          <p className="text-xl text-brand-accent font-medium">
            🎉 Thanks for joining! See you in your inbox.
          </p>
        )}
      </div>
    </div>
  );
};

export default Newsletter;
