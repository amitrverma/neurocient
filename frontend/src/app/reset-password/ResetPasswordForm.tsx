"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

export default function ResetPasswordForm() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenReady, setTokenReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resetToken = new URLSearchParams(window.location.hash.slice(1)).get(
      "token",
    );
    setToken(resetToken);
    setTokenReady(true);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(body?.detail || "This reset link could not be used.");
        return;
      }
      setComplete(true);
    } catch {
      setError("Password recovery is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  if (complete) {
    return (
      <div className="mt-7" role="status">
        <p className="rounded-2xl bg-brand-teal/8 p-4 text-sm leading-6 text-brand-dark">
          Your password has been updated. Sign in again on your next protected
          action.
        </p>
        <Link
          href="/"
          className="mt-5 inline-flex min-h-12 items-center font-semibold text-brand-primary hover:underline"
        >
          Return to Neurocient
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <label className="block text-sm font-semibold text-brand-dark">
        New password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
          required
          className="mt-2 w-full rounded-lg border border-brand-dark/35 px-4 py-3 font-normal outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
        />
      </label>
      <p className="text-xs leading-5 text-brand-dark/60">
        Use 12–128 characters. A long, memorable passphrase works well.
      </p>
      <label className="block text-sm font-semibold text-brand-dark">
        Confirm new password
        <input
          type="password"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="new-password"
          minLength={12}
          maxLength={128}
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
        disabled={loading || !token || !tokenReady}
        className="min-h-12 w-full rounded-full bg-brand-teal px-6 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update password"}
      </button>
      {tokenReady && !token && (
        <p role="alert" className="text-sm text-red-700">
          This reset link is incomplete. Request a new one.
        </p>
      )}
    </form>
  );
}
