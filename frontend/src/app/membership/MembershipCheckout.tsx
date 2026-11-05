"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, CreditCard, LoaderCircle } from "lucide-react";
import AuthModal from "@/app/components/AuthModal";
import { useAuth } from "@/app/context/AuthContext";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on?: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

type MembershipStatus = {
  is_active?: boolean;
  status?: string;
  current_period_end?: string | null;
  checkout_configured?: boolean;
  checkout_offers?: Array<{
    offer_id: "inr" | "usd";
    amount: number;
    currency: "INR" | "USD";
    display_price: string;
    configured: boolean;
  }>;
  checkout_state?: string | null;
  cancellation_state?: string | null;
  cancellation_requested_at?: string | null;
};

const formatAccessDate = (value?: string | null) => {
  if (!value) return null;
  const calendarDate = /^\d{4}-\d{2}-\d{2}/.exec(value)?.[0];
  if (!calendarDate) return null;
  const date = new Date(`${calendarDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
};

const loadRazorpay = () =>
  new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-neurocient-razorpay="true"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => {
        existing.remove();
        resolve(false);
      }, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.dataset.neurocientRazorpay = "true";
    script.onload = () => resolve(true);
    script.onerror = () => {
      script.remove();
      resolve(false);
    };
    document.body.appendChild(script);
  });

export default function MembershipCheckout() {
  const { user, ready } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [pendingAfterAuth, setPendingAfterAuth] = useState(false);
  const [pendingOffer, setPendingOffer] = useState<"inr" | "usd">("inr");
  const [working, setWorking] = useState(false);
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [message, setMessage] = useState("");
  const [confirmCancellation, setConfirmCancellation] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const refreshStatus = useCallback(async () => {
    if (!user) return null;
    const response = await fetch("/api/membership/status", { cache: "no-store" });
    if (!response.ok) return null;
    const next = (await response.json()) as MembershipStatus;
    setStatus(next);
    return next;
  }, [user]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const waitForConfirmation = useCallback(async () => {
    setMessage("Payment submitted. We are confirming it securely.");
    try {
      for (let attempt = 0; attempt < 15; attempt += 1) {
        const next = await refreshStatus();
        if (next?.is_active) {
          setMessage("Your membership is active.");
          setWorking(false);
          return;
        }
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
      }
      setMessage(
        "Confirmation is taking longer than usual. Your account will update after the payment provider confirms it.",
      );
    } catch {
      setMessage(
        "Payment was submitted, but confirmation could not be checked. Your account will update after the payment provider confirms it.",
      );
    }
    setWorking(false);
  }, [refreshStatus]);

  const startCheckout = useCallback(async (offerId: "inr" | "usd") => {
    if (!user) {
      setPendingAfterAuth(true);
      setPendingOffer(offerId);
      setShowAuth(true);
      return;
    }
    setWorking(true);
    setMessage("");
    try {
    const response = await fetch("/api/membership/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offer_id: offerId }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const code = data?.detail?.code;
      setMessage(
        code === "membership_active"
          ? "Your membership is already active."
          : code === "reconciliation_required"
            ? "A previous checkout needs confirmation. Please contact support before trying again."
            : code === "checkout_offer_conflict"
              ? "Another currency checkout is already open. Complete or resolve it before switching currency."
            : "Secure checkout is temporarily unavailable. Please try again shortly.",
      );
      setWorking(false);
      return;
    }
    const expectedCurrency = offerId === "usd" ? "USD" : "INR";
    const expectedAmount = offerId === "usd" ? 600 : 49_900;
    if (
      data.offer_id !== offerId
      || data.currency !== expectedCurrency
      || data.amount !== expectedAmount
    ) {
      setMessage(
        "Checkout did not match the currency you selected. No payment window was opened.",
      );
      setWorking(false);
      return;
    }
    if (!(await loadRazorpay()) || !window.Razorpay) {
      setMessage("The secure payment window could not be loaded. Please try again.");
      setWorking(false);
      return;
    }
      new window.Razorpay({
        key: data.key_id,
        subscription_id: data.subscription_id,
        name: data.name,
        description: data.description,
        prefill: { email: data.email },
        theme: { color: "#5EB1BF" },
        handler: () => void waitForConfirmation(),
        modal: {
          ondismiss: () => {
            setMessage("Checkout closed. You can continue the same checkout when ready.");
            setWorking(false);
          },
        },
      }).open();
    } catch {
      setMessage("Secure checkout is temporarily unavailable. Please try again shortly.");
      setWorking(false);
    }
  }, [user, waitForConfirmation]);

  const active = Boolean(status?.is_active);
  const offerConfigured = (offerId: "inr" | "usd") => {
    const offer = status?.checkout_offers?.find((candidate) => candidate.offer_id === offerId);
    return offer ? offer.configured : offerId === "inr" && status?.checkout_configured !== false;
  };
  const accessDate = formatAccessDate(status?.current_period_end);

  const cancelMembership = useCallback(async () => {
    setCancelling(true);
    setMessage("");
    try {
      const response = await fetch("/api/membership/cancel", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(
          data?.detail?.code === "cancellation_reconciliation_required"
            ? "Your cancellation request needs confirmation from the payment provider. Access remains unchanged while we reconcile it."
            : "Cancellation could not be requested. Please try again shortly.",
        );
      } else {
        setStatus((current) => ({
          ...current,
          cancellation_state: data.status || "requested",
        }));
        setMessage("");
      }
    } catch {
      setMessage(
        "Cancellation confirmation could not be checked. Access remains unchanged while we reconcile it.",
      );
    } finally {
      setCancelling(false);
      setConfirmCancellation(false);
    }
  }, []);

  useEffect(() => {
    if (pendingAfterAuth && user) {
      setPendingAfterAuth(false);
      void startCheckout(pendingOffer);
    }
  }, [pendingAfterAuth, pendingOffer, startCheckout, user]);

  if (active) {
    const cancellationScheduled = ["requested", "completed"].includes(
      status?.cancellation_state || "",
    );
    return (
      <section
        className="mt-7 overflow-hidden rounded-2xl border border-brand-secondary/50 bg-[#f7f3e8] text-brand-dark shadow-[0_18px_50px_rgba(0,0,0,0.16)]"
        role="status"
        aria-live="polite"
      >
        <div className="border-b border-brand-dark/10 px-5 py-5 sm:px-6">
          <p className="inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-secondary text-brand-dark">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            Membership active
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
            Welcome to Neurocient.
          </h2>
          <p className="mt-3 font-sans text-sm leading-6 text-brand-dark/75">
            Your membership is active. You now have full access to Insights,
            Practice, Spots and Microchallenges.
          </p>
          {accessDate ? (
            <p className="mt-3 font-sans text-xs font-semibold uppercase tracking-[0.1em] text-brand-dark/55">
              Access confirmed through {accessDate}
            </p>
          ) : null}
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
          <Link
            href="/practice"
            className="inline-flex min-h-12 items-center justify-between rounded-full bg-brand-secondary px-5 py-3 font-sans text-sm font-bold text-brand-dark transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Begin with Practice
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/insights"
            className="inline-flex min-h-12 items-center justify-between rounded-full border border-brand-dark/25 px-5 py-3 font-sans text-sm font-bold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Explore Insights
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="border-t border-brand-dark/10 px-5 py-4 sm:px-6">
          {cancellationScheduled ? (
            <p className="font-sans text-sm leading-6 text-brand-dark/70">
              Cancellation is scheduled. Your access remains active
              {accessDate ? ` through ${accessDate}` : " through the current paid period"}.
            </p>
          ) : confirmCancellation ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-sans text-sm leading-6 text-brand-dark/70">
                Cancel at the end of the current paid period?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmCancellation(false)}
                  className="min-h-11 rounded-full border border-brand-dark/20 px-4 font-sans text-sm font-semibold"
                >
                  Keep membership
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => void cancelMembership()}
                  className="min-h-11 rounded-full bg-brand-dark px-4 font-sans text-sm font-semibold text-white disabled:opacity-60"
                >
                  {cancelling ? "Requesting…" : "Confirm cancellation"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmCancellation(true)}
              className="min-h-11 font-sans text-sm font-semibold text-brand-dark/65 underline decoration-brand-dark/25 underline-offset-4 hover:text-brand-dark"
            >
              Cancel membership
            </button>
          )}
          {message ? (
            <p className="mt-3 font-sans text-sm leading-6 text-brand-dark/70">
              {message}
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => void startCheckout("inr")}
        disabled={!ready || working || !offerConfigured("inr")}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-brand-secondary bg-brand-secondary px-4 py-3 font-sans text-sm font-semibold text-brand-dark transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {working ? (
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <CreditCard className="h-4 w-4" aria-hidden="true" />
        )}
        {active
          ? "Membership active"
          : working
            ? "Preparing secure checkout…"
            : user
              ? "Join for ₹499/month"
              : "Log in to join"}
      </button>
      <button
        type="button"
        onClick={() => void startCheckout("usd")}
        disabled={!ready || working || !offerConfigured("usd")}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/35 bg-transparent px-4 py-3 font-sans text-sm font-semibold text-white transition hover:border-white/60 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <CreditCard className="h-4 w-4" aria-hidden="true" />
        {user ? "Join for US$6/month" : "Log in to join in USD"}
      </button>
      </div>
      {message ? (
        <p className="mt-4 font-sans text-sm leading-6 text-white/70" role="status">
          {message}
        </p>
      ) : null}
      <AuthModal
        isOpen={showAuth}
        onClose={() => {
          setShowAuth(false);
          setPendingAfterAuth(false);
        }}
        onSuccess={() => setPendingAfterAuth(true)}
        context="membership_checkout"
      />
    </>
  );
}
