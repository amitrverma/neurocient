"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
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

type CheckoutResponse = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type MyCohortEnrollment = {
  status: string;
  cohort: { id: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on?: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-neurocient-razorpay="true"]',
    );
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.neurocientRazorpay = "true";
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => {
      script.remove();
      resolve(false);
    };
    document.body.appendChild(script);
  });

export default function Pricing() {
  const { user, ready } = useAuth();
  const [cohort, setCohort] = useState<Cohort | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [hasConfirmedPlace, setHasConfirmedPlace] = useState(false);
  const userId = user?.id;

  const refreshCohort = useCallback(async () => {
    const response = await fetch("/api/cohorts/modern-caveman", { cache: "no-store" });
    const data = await response.json();
    setCohort(data.cohort || null);
  }, []);

  const refreshEnrollment = useCallback(async (cohortId: string) => {
    if (!userId) {
      setHasConfirmedPlace(false);
      return false;
    }
    try {
      const response = await fetch("/api/cohorts/my", { cache: "no-store" });
      if (!response.ok) return false;
      const data = await response.json();
      const confirmed = (data.enrollments || []).some(
        (enrollment: MyCohortEnrollment) =>
          enrollment.cohort?.id === cohortId
          && ["paid", "active", "completed"].includes(enrollment.status),
      );
      setHasConfirmedPlace(confirmed);
      return confirmed;
    } catch {
      return false;
    }
  }, [userId]);

  useEffect(() => {
    refreshCohort()
      .catch(() => setMessage("Cohort details are temporarily unavailable."))
      .finally(() => setLoading(false));
  }, [refreshCohort]);

  useEffect(() => {
    if (ready && cohort?.id) void refreshEnrollment(cohort.id);
  }, [cohort?.id, ready, refreshEnrollment]);

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
    try {
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

      const checkout = new window.Razorpay({
        key: data.key_id,
        order_id: data.order_id,
        amount: data.amount,
        currency: data.currency,
        name: "Neurocient",
        description: data.cohort_title,
        prefill: { email: data.email },
        theme: { color: "#5EB1BF" },
        handler: async (payment: CheckoutResponse) => {
          setMessage("Authenticating payment responseâ€¦");
          try {
            const verificationResponse = await fetch(`/api/cohorts/${cohort.id}/checkout/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payment),
            });
            const verification = await verificationResponse.json().catch(() => ({}));

            if (!verificationResponse.ok || verification.verified !== true) {
              setMessage("We could not authenticate the payment response. Your place has not been confirmed. Please contact support before retrying.");
            } else if (
              verification.confirmed === true
              || await refreshEnrollment(cohort.id)
            ) {
              setHasConfirmedPlace(true);
              await refreshCohort();
              setMessage("");
            } else {
              setMessage("Payment authenticated. We are waiting for Razorpay to confirm capture before reserving your place.");
            }
          } catch {
            setMessage("Payment was submitted, but its confirmation could not be checked. Please contact support before retrying.");
          } finally {
            setWorking(false);
          }
        },
        modal: {
          ondismiss: () => {
            setMessage("Checkout closed. No place has been confirmed.");
            setWorking(false);
          },
        },
      });

      checkout.on?.("payment.failed", () => {
        setMessage("Payment was not completed. No place has been confirmed. You can try again.");
        setWorking(false);
      });
      checkout.open();
    } catch {
      setMessage("Checkout could not be started. Please try again shortly.");
      setWorking(false);
    }
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

          <div className="mc-price-action">
            {hasConfirmedPlace ? (
              <div
                className="mc-reservation-confirmation"
                role="status"
              >
                <span className="mc-reservation-mark" aria-hidden="true">
                  <Check className="h-5 w-5" strokeWidth={2.5} />
                </span>
                <div>
                  <p className="mc-reservation-label">Payment complete</p>
                  <h4>You're in.</h4>
                  <p className="mc-reservation-detail">
                    Your place in {cohort?.title || "this cohort"} is confirmed.
                  </p>
                  <p className="mc-reservation-next">No further action is needed right now.</p>
                </div>
              </div>
            ) : cohort?.enrollment_open ? (
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
          <div>
            <p>
              Attend the first session. If the program does not feel right for
              you, email <a href="mailto:support@neurocient.com" className="font-semibold underline underline-offset-4">support@neurocient.com</a> within
              48 hours of that session for a full refund.
            </p>
          </div>
          <div><p>Your place is confirmed only after payment is verified. If a cohort reaches capacity, enrollment closes and the waitlist opens.</p></div>
        </div>
      </div>
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </section>
  );
}
