"use client";

import { useEffect, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "@/app/components/AuthModal";

type Cohort = {
  id: string;
  title: string;
  starts_at: string;
  timezone: string;
  capacity: number;
  seats_remaining: number;
  price_minor: number;
  currency: string;
  enrollment_open: boolean;
  waitlist_available: boolean;
  checkout_configured: boolean;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Pricing() {
  const { user, ready } = useAuth();
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    fetch("/api/cohorts/modern-caveman", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setCohort(data.cohort || null))
      .catch(() => setMessage("Cohort details are temporarily unavailable."))
      .finally(() => setLoading(false));
  }, []);

  const joinWaitlist = async () => {
    if (!user) return setShowAuth(true);
    if (!cohort) return;
    setWorking(true);
    const response = await fetch(`/api/cohorts/${cohort.id}/waitlist`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? `You are on the waitlist${data.position ? ` at position ${data.position}` : ""}.` : "We could not add you to the waitlist.");
    setWorking(false);
  };

  const startCheckout = async () => {
    if (!user) return setShowAuth(true);
    if (!cohort) return;
    setWorking(true);
    setMessage("");
    const response = await fetch(`/api/cohorts/${cohort.id}/checkout`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(response.status === 409 ? "This cohort has just filled. You can join the waitlist." : "Checkout is not available yet. Please check back shortly.");
      setWorking(false);
      return;
    }
    if (!(await loadRazorpay()) || !window.Razorpay) {
      setMessage("The secure payment window could not be loaded.");
      setWorking(false);
      return;
    }
    new window.Razorpay({
      key: data.key_id,
      order_id: data.order_id,
      amount: data.amount,
      currency: data.currency,
      name: "Neurocient",
      description: data.cohort_title,
      prefill: { email: data.email },
      theme: { color: "#5EB1BF" },
      handler: () => {
        setMessage("Payment received. We are confirming your place securely.");
        setWorking(false);
      },
      modal: { ondismiss: () => setWorking(false) },
    }).open();
  };

  const formattedPrice = cohort
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: cohort.currency, maximumFractionDigits: 0 }).format(cohort.price_minor / 100)
    : "₹21,000";

  return (
    <section id="pricing" className="mc-section mc-pricing">
      <div className="mc-pricing-inner">
        <div className="mc-section-heading">
          <span className="mc-kicker">Join a facilitated cohort</span>
          <h2>Four weeks to turn insight into a way of working.</h2>
          <p className="text-lg leading-relaxed text-brand-dark/70">
            The Modern Caveman is a live, facilitated personal program—not a subscription or a self-paced course.
          </p>
        </div>

        <div className="mc-price-box">
          <div className="flex-1 space-y-3">
            <p className="mc-price-label">Cohort fee</p>
            <h3>{formattedPrice}</h3>
            {loading ? (
              <p className="flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading the next cohort</p>
            ) : cohort ? (
              <div className="mc-cohort-facts">
                <p>{cohort.title}</p>
                <p>Starts {new Date(cohort.starts_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                <p>{cohort.seats_remaining > 0 ? `${cohort.seats_remaining} of ${cohort.capacity} places available` : "Cohort full"}</p>
              </div>
            ) : (
              <p>The next cohort will be announced here.</p>
            )}
          </div>

          <div className="shrink-0">
            {cohort?.enrollment_open ? (
              <button className="mc-checkout-button" disabled={working || !ready} onClick={startCheckout}>
                {working ? "Preparing…" : user ? "Reserve my place" : "Log in to join"}<ArrowRight className="h-4 w-4" />
              </button>
            ) : cohort?.waitlist_available ? (
              <button className="mc-checkout-button" disabled={working || !ready} onClick={joinWaitlist}>
                {working ? "Adding…" : user ? "Join the waitlist" : "Log in to join waitlist"}<ArrowRight className="h-4 w-4" />
              </button>
            ) : cohort ? (
              <p className="font-sans text-sm text-white/70">Enrollment opens soon.</p>
            ) : null}
          </div>
        </div>

        {message ? <p className="mc-checkout-message" role="status">{message}</p> : null}
        {cohort && !cohort.checkout_configured && cohort.enrollment_open ? (
          <p className="mc-checkout-note">Online enrollment is being prepared. Your account will be required before payment.</p>
        ) : null}

        <div className="mc-pricing-close">
          <p>Four weeks of structure, live sessions, nudges, tools, and a framework you can keep using after the cohort ends.</p>
          <div><p>Your place is confirmed only after payment is verified. If a cohort reaches capacity, enrollment closes and the waitlist opens.</p></div>
        </div>
      </div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </section>
  );
}
