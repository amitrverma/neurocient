"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "./NotificationProvider";
import { trackEvent } from "../utils/analytics";
import usePushNotifications from "@/app/hooks/usePushNotifications";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  disableEscape?: boolean;
  context?: string;
}

const AuthModal = ({
  isOpen,
  onClose,
  onSuccess,
  disableEscape = false,
  context,
}: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { notify } = useNotification();
  const { subscribe } = usePushNotifications(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  );

  const finishAuth = async (eventName: string) => {
    await login();
    onClose();
    onSuccess?.();
    trackEvent(eventName);

    if (Notification.permission === "granted") {
      await subscribe();
    } else {
      notify(
        "Push notifications are disabled. You can enable them anytime from Profile -> Preferences.",
      );
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken(true);

      const res = await fetch("/api/auth/firebase-login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      await res.json().catch(() => ({}));

      if (res.ok) {
        await finishAuth("Login Completed");
      } else {
        notify("Google login failed.", "error");
      }
    } catch (err) {
      console.error("Google login failed:", err);
      notify("Google login failed", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint =
        mode === "signup" ? "/api/auth/signup" : "/api/auth/login";

      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        await res.json().catch(() => ({}));
        await finishAuth(
          mode === "signup" ? "Signup Completed" : "Login Completed",
        );
      } else {
        const errData = await res.json().catch(() => ({}));
        notify(errData?.detail || "Failed to authenticate.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        if (!disableEscape) onClose();
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-brand-dark/55" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg border border-brand-dark/10 bg-white p-6 font-sans text-brand-dark shadow-[0_24px_80px_rgba(4,42,43,0.22)] md:p-7">
          <div className="mb-5 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
              {mode === "login" ? "Welcome back" : "Create account"}
            </p>
            <Dialog.Title className="text-2xl font-bold leading-tight tracking-[-0.015em] text-brand-dark">
              {mode === "login" ? "Log in" : "Sign up"}
              {context ? ` to ${context}` : ""}
            </Dialog.Title>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-brand-dark/40 px-4 py-3 text-sm text-brand-dark outline-none transition placeholder:text-brand-dark/45 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-brand-dark/40 px-4 py-3 text-sm text-brand-dark outline-none transition placeholder:text-brand-dark/45 focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
              required
            />
            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg border border-brand-secondary bg-brand-secondary px-5 py-3 text-sm font-semibold text-brand-dark transition hover:border-brand-dark hover:bg-brand-dark hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Log in"
                  : "Sign up"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-brand-dark/12" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark/45">
              or
            </span>
            <span className="h-px flex-1 bg-brand-dark/12" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-brand-dark/35 bg-white px-5 py-3 text-sm font-semibold text-brand-dark transition hover:border-brand-teal hover:bg-brand-teal/5"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <p className="mt-5 text-center text-sm text-brand-dark/72">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="cursor-pointer font-semibold text-brand-primary hover:underline"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const GoogleIcon = () => (
  <svg
    aria-hidden="true"
    className="h-5 w-5"
    viewBox="0 0 24 24"
    focusable="false"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z"
    />
  </svg>
);

export default AuthModal;
