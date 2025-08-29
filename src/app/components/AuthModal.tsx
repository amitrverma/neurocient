"use client";

import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { useAuth } from "../context/AuthContext";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { useNotification } from "./NotificationProvider";
import { trackEvent } from "../utils/analytics";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  disableEscape?: boolean; // 👈 new
}

const AuthModal = ({ isOpen, onClose, onSuccess, disableEscape = false }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { notify } = useNotification();

  // 🔑 Google login flow
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch("/api/auth/firebase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      if (data.token) {
        login(data.token);
        onClose();
        if (onSuccess) onSuccess();
        trackEvent("Login Completed");
      } else if (data.preview) {
        notify("You’re in preview mode (waitlist).");
      }
    } catch (err) {
      console.error("Google login failed:", err);
    }
  };

  // 📧 Email/password login or signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        login(data.token);
        onClose();
        if (onSuccess) onSuccess();
        if (mode === "signup") trackEvent("Signup Completed");
        else trackEvent("Login Completed");
      } else {
        notify("Failed to authenticate.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={disableEscape ? () => {} : onClose} // 👈 block closing if disableEscape
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
          <Dialog.Title className="text-xl font-bold mb-4 text-center">
            {mode === "login" ? "Log in" : "Sign up"}
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
              className="w-full bg-brand-secondary text-brand-dark py-2 rounded-lg font-semibold hover:bg-brand-primary hover:text-white transition"
              disabled={loading}
            >
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Sign up"}
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
              className="text-brand-primary font-semibold"
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
