"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Check, CircleAlert, LoaderCircle } from "lucide-react";
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
  enrollment_window_open?: boolean;
  waitlist_available: boolean;
  checkout_configured: boolean;
  checkout_offers?: Array<{
    offer_id: "inr" | "usd";
    amount: number;
    currency: "INR" | "USD";
    display_price: string;
    configured: boolean;
  }>;
};

type CheckoutResponse = {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type MyCohortEnrollment = {
  status: string;
  payment_confirmation_pending?: boolean;
  cohort: { id: string };
};

type WaitlistStatus = {
  status: string;
  can_checkout: boolean;
  offer_expires_at?: string | null;
  offer_email_status?: string | null;
};

type ConfirmationStatus = "idle" | "checking" | "delayed";

const errorCode = (data: unknown): string | undefined => {
  if (!data || typeof data !== "object" || !("detail" in data)) return undefined;
  const detail = data.detail;
  if (!detail || typeof detail !== "object" || !("code" in detail)) return undefined;
  return typeof detail.code === "string" ? detail.code : undefined;
};

const withReference = (message: string, response: Response): string => {
  const correlationId = response.headers.get("x-correlation-id");
  return correlationId ? `${message} Reference: ${correlationId.slice(0, 8)}.` : message;
};

const CHECKOUT_WINDOW_TIMEOUT_MS = 3_000;
const CONFIRMATION_POLL_INTERVAL_MS = 2_000;
const CONFIRMATION_POLL_ATTEMPTS = 15;
const CHECKOUT_OFFERS = {
  inr: { amount: 2_100_000, currency: "INR" },
  usd: { amount: 24_900, currency: "USD" },
} as const;

const parseBackendDate = (value: string): Date => new Date(
  `${value}${/[zZ]|[+-]\d\d:\d\d$/.test(value) ? "" : "Z"}`,
);

const checkoutWindowIsPresent = (): boolean => Array.from(
  document.querySelectorAll<HTMLElement>(
    "iframe.razorpay-checkout-frame, .razorpay-container",
  ),
).some((element) => {
  if (!element.isConnected || element.hidden || element.getAttribute("aria-hidden") === "true") {
    return false;
  }
  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
});

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
  const [messageIsError, setMessageIsError] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [hasConfirmedPlace, setHasConfirmedPlace] = useState(false);
  const [checkoutUncertain, setCheckoutUncertain] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<ConfirmationStatus>("idle");
  const [waitlistStatus, setWaitlistStatus] = useState<WaitlistStatus | null>(null);
  const userId = user?.id;

  const refreshCohort = useCallback(async () => {
    const response = await fetch("/api/cohorts/modern-caveman", { cache: "no-store" });
    const data = await response.json();
    setCohort(data.cohort || null);
  }, []);

  const refreshEnrollment = useCallback(async (cohortId: string) => {
    if (!userId) {
      setHasConfirmedPlace(false);
      setCheckoutUncertain(false);
      return false;
    }
    try {
      const response = await fetch("/api/cohorts/my", { cache: "no-store" });
      if (!response.ok) return false;
      const data = await response.json();
      const enrollment = (data.enrollments || []).find(
        (candidate: MyCohortEnrollment) => candidate.cohort?.id === cohortId,
      ) as MyCohortEnrollment | undefined;
      const confirmed = Boolean(
        enrollment && ["paid", "active", "completed"].includes(enrollment.status),
      );
      const uncertain = Boolean(
        enrollment && ["checkout_creating", "checkout_unknown"].includes(enrollment.status),
      );
      setHasConfirmedPlace(confirmed);
      setCheckoutUncertain(uncertain);
      if (confirmed) {
        setConfirmationStatus("idle");
      } else if (enrollment?.payment_confirmation_pending) {
        setConfirmationStatus((current) => current === "delayed" ? current : "checking");
      }
      return confirmed;
    } catch {
      return false;
    }
  }, [userId]);

  const refreshWaitlistStatus = useCallback(async (cohortId: string) => {
    if (!userId) {
      setWaitlistStatus(null);
      return;
    }
    try {
      const response = await fetch(`/api/cohorts/${cohortId}/waitlist/status`, { cache: "no-store" });
      if (!response.ok) return;
      setWaitlistStatus(await response.json());
    } catch {
      // The public cohort state remains usable if this account-specific refresh fails.
    }
  }, [userId]);

  useEffect(() => {
    refreshCohort()
      .catch(() => setMessage("Cohort details are temporarily unavailable."))
      .finally(() => setLoading(false));
  }, [refreshCohort]);

  useEffect(() => {
    if (ready && cohort?.id) {
      void refreshEnrollment(cohort.id);
      void refreshWaitlistStatus(cohort.id);
    }
  }, [cohort?.id, ready, refreshEnrollment, refreshWaitlistStatus]);

  useEffect(() => {
    if (!waitlistStatus?.can_checkout || !waitlistStatus.offer_expires_at) return;
    const expiresAt = parseBackendDate(waitlistStatus.offer_expires_at).getTime();
    if (Number.isNaN(expiresAt)) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      setWaitlistStatus((current) => current ? { ...current, can_checkout: false } : current);
      return;
    }
    const timer = window.setTimeout(() => {
      setWaitlistStatus((current) => current ? { ...current, can_checkout: false } : current);
    }, remaining);
    return () => window.clearTimeout(timer);
  }, [waitlistStatus?.can_checkout, waitlistStatus?.offer_expires_at]);

  useEffect(() => {
    if (confirmationStatus !== "checking" || !cohort?.id) return;

    let active = true;
    let attempts = 0;
    let timer: number | undefined;

    const checkConfirmation = async () => {
      attempts += 1;
      const confirmed = await refreshEnrollment(cohort.id);
      if (!active) return;
      if (confirmed) {
        setConfirmationStatus("idle");
        setMessage("");
        await refreshCohort().catch(() => undefined);
        return;
      }
      if (attempts >= CONFIRMATION_POLL_ATTEMPTS) {
        setConfirmationStatus("delayed");
        return;
      }
      timer = window.setTimeout(checkConfirmation, CONFIRMATION_POLL_INTERVAL_MS);
    };

    timer = window.setTimeout(checkConfirmation, CONFIRMATION_POLL_INTERVAL_MS);
    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [cohort?.id, confirmationStatus, refreshCohort, refreshEnrollment]);

  const joinWaitlist = async () => {
    if (!user) return setShowAuth(true);
    if (!cohort) return;
    setWorking(true);
    const response = await fetch(`/api/cohorts/${cohort.id}/waitlist`, { method: "POST" });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? `You are on the waitlist${data.position ? ` at position ${data.position}` : ""}.` : "We could not add you to the waitlist.");
    setMessageIsError(!response.ok);
    if (response.ok) setWaitlistStatus(data);
    setWorking(false);
  };

  const startCheckout = async (offerId: "inr" | "usd") => {
    if (!user) return setShowAuth(true);
    if (!cohort) return;
    let checkoutOpenWatchdog: number | undefined;
    const stopCheckoutOpenWatchdog = () => {
      if (checkoutOpenWatchdog !== undefined) {
        window.clearTimeout(checkoutOpenWatchdog);
        checkoutOpenWatchdog = undefined;
      }
    };
    setWorking(true);
    setMessage("");
    setMessageIsError(false);
    setConfirmationStatus("idle");
    try {
      const response = await fetch(`/api/cohorts/${cohort.id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offer_id: offerId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const code = errorCode(data);
        let nextMessage: string;
        if (code === "checkout_reconciliation_required") {
          nextMessage = "This checkout attempt may have reached the payment provider, so we cannot safely start another one yet. Your place is not confirmed. Please contact support before trying again.";
          setCheckoutUncertain(true);
        } else if (code === "cohort_full") {
          nextMessage = "This cohort has just filled. You can join the waitlist.";
          await Promise.all([
            refreshCohort().catch(() => undefined),
            refreshWaitlistStatus(cohort.id),
          ]);
        } else if (code === "checkout_offer_conflict") {
          nextMessage = "Another currency checkout is already open. Complete or resolve it before switching currency.";
        } else if (response.status === 409) {
          nextMessage = "Your enrollment status has changed. Refresh the page before trying again.";
        } else if (response.status === 429) {
          nextMessage = "There have been several checkout attempts. Please wait before trying again. You have not been charged.";
        } else if (response.status === 401) {
          nextMessage = "Your session has ended. Please log in again before starting checkout.";
        } else {
          nextMessage = "Secure checkout is temporarily unavailable. Checkout did not start, and you have not been charged. Please try again later.";
        }
        setMessage(withReference(nextMessage, response));
        setMessageIsError(true);
        setWorking(false);
        return;
      }
      const expectedOffer = CHECKOUT_OFFERS[offerId];
      if (
        data.offer_id !== offerId
        || data.amount !== expectedOffer.amount
        || data.currency !== expectedOffer.currency
      ) {
        setMessage("Checkout did not match the currency you selected. No payment window was opened.");
        setMessageIsError(true);
        setWorking(false);
        return;
      }
      if (!(await loadRazorpay()) || !window.Razorpay) {
        setMessage("The secure payment window could not be loaded.");
        setMessageIsError(true);
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
          stopCheckoutOpenWatchdog();
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
              setMessageIsError(true);
            } else if (verification.confirmed === true) {
              setHasConfirmedPlace(true);
              await refreshCohort();
              setMessage("");
            } else {
              setMessage("");
              setConfirmationStatus("checking");
            }
          } catch {
            setMessage("Payment was submitted, but its confirmation could not be checked. Please contact support before retrying.");
            setMessageIsError(true);
          } finally {
            setWorking(false);
          }
        },
        modal: {
          ondismiss: () => {
            stopCheckoutOpenWatchdog();
            setMessage("Checkout closed. No place has been confirmed.");
            setWorking(false);
          },
        },
      });

      checkout.on?.("payment.failed", () => {
        stopCheckoutOpenWatchdog();
        setMessage("Payment was not completed. No place has been confirmed. You can try again.");
        setMessageIsError(true);
        setWorking(false);
      });
      checkoutOpenWatchdog = window.setTimeout(() => {
        if (!checkoutWindowIsPresent()) {
          setMessage("The secure payment window did not open. Checkout did not start, and you have not been charged. Please try again later.");
          setMessageIsError(true);
          setWorking(false);
        }
        checkoutOpenWatchdog = undefined;
      }, CHECKOUT_WINDOW_TIMEOUT_MS);
      checkout.open();
    } catch {
      stopCheckoutOpenWatchdog();
      setMessage("Checkout could not be started. Please try again shortly.");
      setMessageIsError(true);
      setWorking(false);
    }
  };

  const offerConfigured = (offerId: "inr" | "usd") => {
    const offer = cohort?.checkout_offers?.find((candidate) => candidate.offer_id === offerId);
    return offer ? offer.configured : offerId === "inr" && cohort?.checkout_configured === true;
  };
  const formattedPrice = cohort?.checkout_offers?.length
    ? cohort.checkout_offers.map((offer) => offer.display_price).join(" / ")
    : cohort
      ? new Intl.NumberFormat("en-IN", { style: "currency", currency: cohort.currency, maximumFractionDigits: 0 }).format(cohort.price_minor / 100)
      : "₹21,000 / US$249";

  const hasWaitlistOffer = waitlistStatus?.can_checkout === true;
  const waitlistOfferNeedsReview = waitlistStatus?.status === "offered"
    && waitlistStatus.offer_email_status === "reconciliation_required";
  const waitlistOfferBeingPrepared = waitlistStatus?.status === "offered"
    && waitlistStatus.offer_email_status !== "sent"
    && !waitlistOfferNeedsReview;
  const waitlistOfferDeadline = hasWaitlistOffer && waitlistStatus.offer_expires_at
    ? parseBackendDate(waitlistStatus.offer_expires_at).toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : null;

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
                <p>{hasWaitlistOffer ? "One place held for you" : cohort.seats_remaining > 0 ? `${cohort.seats_remaining} of ${cohort.capacity} places available` : "Cohort full"}</p>
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
                  <h4>You&apos;re in.</h4>
                  <p className="mc-reservation-detail">
                    Your place in {cohort?.title || "this cohort"} is confirmed.
                  </p>
                  <p className="mc-reservation-next">No further action is needed right now.</p>
                </div>
              </div>
            ) : checkoutUncertain ? (
              <div
                className="mc-reservation-confirmation mc-reservation-confirmation--pending"
                role="status"
                aria-live="polite"
              >
                <span className="mc-reservation-mark mc-reservation-mark--pending" aria-hidden="true">
                  <CircleAlert className="h-5 w-5" />
                </span>
                <div>
                  <p className="mc-reservation-label">Checkout unresolved</p>
                  <h4>Do not pay again</h4>
                  <p className="mc-reservation-detail">A previous checkout may have reached the payment provider.</p>
                  <p className="mc-reservation-next">Your place is not confirmed yet. Contact support so we can reconcile it safely.</p>
                </div>
              </div>
            ) : confirmationStatus !== "idle" ? (
              <div
                className="mc-reservation-confirmation mc-reservation-confirmation--pending"
                role="status"
                aria-live="polite"
              >
                <span className="mc-reservation-mark mc-reservation-mark--pending" aria-hidden="true">
                  <LoaderCircle className={confirmationStatus === "checking" ? "h-5 w-5 animate-spin" : "h-5 w-5"} />
                </span>
                <div>
                  <p className="mc-reservation-label">Payment processing</p>
                  <h4>{confirmationStatus === "checking" ? "Confirming your place" : "Confirmation is taking longer"}</h4>
                  <p className="mc-reservation-detail">
                    We received the payment response and are waiting for final confirmation.
                  </p>
                  <p className="mc-reservation-next">
                    {confirmationStatus === "checking"
                      ? "Please keep this page open and do not pay again."
                      : "Do not pay again. Refresh this page after a few minutes or contact support if your place is still not confirmed."}
                  </p>
                </div>
              </div>
            ) : waitlistOfferNeedsReview ? (
              <div className="font-sans text-sm text-white/80" role="status">
                <p className="font-bold text-white">Your place needs an email check.</p>
                <p className="mt-1">We could not confirm whether the payment email was accepted. Your payment window has not been confirmed, and our team needs to resolve it before you pay.</p>
              </div>
            ) : waitlistOfferBeingPrepared ? (
              <div className="font-sans text-sm text-white/80" role="status">
                <p className="font-bold text-white">A place is being prepared for you.</p>
                <p className="mt-1">We will email your payment link when delivery is confirmed. Your 24-hour payment window has not started yet.</p>
              </div>
            ) : cohort?.enrollment_open || hasWaitlistOffer ? (
              <div className="grid gap-3">
              {hasWaitlistOffer ? (
                <div className="mb-1 text-white" role="status">
                  <p className="font-sans text-xs font-bold uppercase tracking-wider text-brand-yellow">Your waitlist place is available</p>
                  <p className="mt-1 font-sans text-sm text-white/80">Complete payment{waitlistOfferDeadline ? ` by ${waitlistOfferDeadline}` : " before the offer expires"}. The offer belongs to this account.</p>
                </div>
              ) : null}
              <button className="mc-checkout-button" disabled={working || !ready || !offerConfigured("inr")} onClick={() => void startCheckout("inr")}>
                {working ? "Preparing…" : user ? "Reserve my place · ₹21,000" : "Log in to join"}<ArrowRight className="h-4 w-4" />
              </button>
              <button
                className="mc-checkout-button mc-checkout-button--secondary"
                disabled={working || !ready || !offerConfigured("usd")}
                onClick={() => void startCheckout("usd")}
              >
                {user ? "Reserve for US$249" : "Log in to join in USD"}<ArrowRight className="h-4 w-4" />
              </button>
              </div>
            ) : cohort?.waitlist_available ? (
              <button className="mc-checkout-button" disabled={working || !ready} onClick={joinWaitlist}>
                {working ? "Adding…" : user ? "Join the waitlist" : "Log in to join waitlist"}<ArrowRight className="h-4 w-4" />
              </button>
            ) : cohort ? (
              <p className="font-sans text-sm text-white/70">Enrollment is not currently open for this cohort.</p>
            ) : null}
          </div>
        </div>

        {message ? (
          <div
            className={`mc-checkout-feedback${messageIsError ? " mc-checkout-feedback--error" : ""}`}
            role={messageIsError ? "alert" : "status"}
          >
            <span className="mc-checkout-feedback-mark" aria-hidden="true">
              <CircleAlert className="h-5 w-5" />
            </span>
            <div>
              <p className="mc-checkout-feedback-label">
                {messageIsError ? "Checkout could not continue" : "Checkout update"}
              </p>
              <p className="mc-checkout-message">{message}</p>
            </div>
          </div>
        ) : null}
        {cohort && !offerConfigured("inr") && !offerConfigured("usd") && cohort.enrollment_open ? (
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
