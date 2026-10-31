"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

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
        setError(body?.detail || "Password recovery is temporarily unavailable.");
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
    <main className="surface-page min-h-[75vh] px-5 py-16 md:py-24">
      <section className="mx-auto max-w-md rounded-3xl border border-brand-dark/10 bg-white p-7 shadow-sm md:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-teal">
          Account recovery
        </p>
        <h1 className="mt-3 font-serif text-3xl text-brand-dark">
          Reset your password
        </h1>
        <p className="mt-4 text-sm leading-6 text-brand-dark/70">
          Enter the email used for your Neurocient account. We will send a
          single-use link if password recovery is available for it.
        </p>

        {message ? (
          <div className="mt-7" role="status">
            <p className="rounded-2xl bg-brand-teal/8 p-4 text-sm leading-6 text-brand-dark">
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
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold text-brand-dark">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="mt-2 w-full rounded-lg border border-brand-dark/35 px-4 py-3 font-normal outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="min-h-12 w-full rounded-full bg-brand-teal px-6 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
