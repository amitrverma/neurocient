"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import AccountRecoveryShell from "@/app/components/AccountRecoveryShell";
import { apiErrorMessage } from "@/lib/apiError";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(
          apiErrorMessage(
            body,
            "Password recovery is temporarily unavailable.",
            response,
          ),
        );
        return;
      }
      setMessage(
        "If that address can use password recovery, a reset link has been sent.",
      );
    } catch {
      setError("Password recovery is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccountRecoveryShell
      title="Reset your password"
      description="Enter the email used for your Neurocient account. We will send a single-use link if password recovery is available for it."
    >
      {message ? (
        <div className="mt-6" role="status">
          <p className="rounded-lg border border-brand-teal/25 bg-brand-teal/8 p-4 text-sm leading-6 text-brand-dark">
            {message}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-12 items-center font-semibold text-brand-primary hover:underline"
          >
            Return to Neurocient
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-brand-dark">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="mt-2 w-full rounded-lg border border-brand-dark/35 px-4 py-3 font-sans font-normal outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
            />
          </label>
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-5 text-red-800"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="min-h-12 w-full rounded-lg border border-brand-secondary bg-brand-secondary px-6 text-sm font-semibold text-brand-dark transition hover:border-brand-dark hover:bg-brand-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
      )}
    </AccountRecoveryShell>
  );
}
