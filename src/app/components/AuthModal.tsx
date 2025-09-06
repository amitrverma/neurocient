"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useAuth } from "../context/AuthContext";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
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
    // ✅ use hook inside component
  const { subscribe } = usePushNotifications(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!);

  // 🔑 Google login flow
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

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        await login(); // 👈 hydrate user
        onClose();
        onSuccess?.();
        trackEvent("Login Completed");

        // 🔔 Push permission check

        if (Notification.permission === "granted") {
          await subscribe(); // no userId needed anymore
        } else {
          notify("Push notifications are disabled. You can enable them anytime from Profile → Preferences.");
        }

      } else {
        notify("Google login failed.", "error");
      }
    } catch (err) {
      console.error("🔥 Google login failed:", err);
      notify("Google login failed", "error");
    }
  };

  // 📧 Email/password login or signup
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
        const data = await res.json().catch(() => ({}));
        await login();
        onClose();
        onSuccess?.();
        trackEvent(mode === "signup" ? "Signup Completed" : "Login Completed");

      // 🔔 Push permission check
        
           if (Notification.permission === "granted") {
              await subscribe(); // no userId needed anymore
            } else {
              notify("Push notifications are disabled. You can enable them anytime from Profile → Preferences.");
            }
        
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
        if (!disableEscape) onClose(); // block escape/backdrop if disabled
      }}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
          <Dialog.Title className="text-xl font-bold mb-4 text-center">
            {mode === "login" ? "Log in" : "Sign up"}
            {context ? ` to ${context}` : ""}
          </Dialog.Title>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-2 border rounded-lg"
              required
            />
            <button
              type="submit"
              className="w-full bg-brand-secondary text-brand-dark py-2 rounded-lg font-semibold hover:bg-brand-primary hover:text-white transition cursor-pointer"
              disabled={loading}
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                ? "Log in"
                : "Sign up"}
            </button>
          </form>

          {/* Google login */}
          <button
            onClick={handleGoogleLogin}
            className="mt-4 w-full border rounded-lg py-2 hover:bg-gray-50 transition"
          >
            Continue with Google
          </button>

          {/* Switch mode */}
          <p className="mt-4 text-sm text-center">
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-brand-primary font-semibold cursor-pointer"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </Dialog>
  );
};

export default AuthModal;
