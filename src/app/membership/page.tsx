"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";

const membershipPaymentUrl = process.env.NEXT_PUBLIC_RAZORPAY_MEMBERSHIP_URL;

const plans = [
  {
    name: "Explorer",
    price: "$0",
    desc: "Start seeing the pattern. Free resources to get oriented.",
    features: [
      "Inner Caveman guide",
      "Caveman diagnostics",
      "Weekly newsletter",
      "Sample micro-challenges",
    ],
  },
  {
    name: "Member",
    price: "$9",
    desc: "Tools, challenges, and deeper guidance for everyday practice.",
    features: [
      "Everything in Explorer",
      "Unlimited articles",
      "Unlimited tools",
      "Discounts for programs",
    ],
    featured: true,
  },
];

export default function MembershipPage() {
  useEffect(() => {
    if (!membershipPaymentUrl) return;

    if (!document.getElementById("razorpay-embed-btn-js")) {
      const script = document.createElement("script");
      script.src = "https://cdn.razorpay.com/static/embed_btn/bundle.js";
      script.defer = true;
      script.id = "razorpay-embed-btn-js";
      document.body.appendChild(script);
      return;
    }

    const rzpWindow = window as Window & {
      __rzp__?: { init?: () => void };
    };
    rzpWindow.__rzp__?.init?.();
  }, []);

  return (
    <main className="bg-brand-dark px-6 py-16 font-serif text-white md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
          <span>Membership</span>
          <span className="h-px flex-1 bg-white/20" />
        </div>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight md:text-5xl">
          Go deeper. Work with your wiring.
        </h1>
        <p className="mt-5 max-w-2xl font-sans text-base leading-8 text-white/70">
          Free resources get you started. Membership gives you the toolkit:
          weekly insights, practical exercises, live sessions, and structured
          programs to help the framework become usable in real life.
        </p>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-lg border p-6 ${
                plan.featured
                  ? "border-brand-primary bg-brand-dark"
                  : "border-white/15 bg-white/5"
              }`}
            >
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                {plan.name}
              </p>
              <p className="mt-4 text-5xl font-bold">
                {plan.price}
                <span className="font-sans text-base font-normal text-white/45">
                  /mo
                </span>
              </p>
              <p className="mt-3 font-sans text-sm leading-6 text-white/64">
                {plan.desc}
              </p>
              <ul className="mt-6 space-y-3 font-sans text-sm text-white/75">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-secondary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.featured && membershipPaymentUrl ? (
                <div className="mt-7">
                  <div
                    className="razorpay-embed-btn"
                    data-url={membershipPaymentUrl}
                    data-text="Get started"
                    data-color="#ffffff"
                    data-size="large"
                  />
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
