"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../components/AuthModal";

interface ProtectedCTAProps {
  children: React.ReactNode;
  redirect: string; // where to go after auth
  context?: string;
}

const ProtectedCTA = ({ children, redirect, context }: ProtectedCTAProps) => {
  const { user, ready } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);

  const handleClick = () => {
    if (!ready) return;
    if (user) {
      router.push(redirect); // ✅ already logged in
    } else {
      setShowAuth(true); // open modal
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="px-6 py-3 border text-brand-dark rounded-xl hover:bg-brand-primary hover:text-white transition"
      >
        {children}
      </button>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        context={context}
        onSuccess={() => {
          setShowAuth(false);
          router.push(redirect); // ✅ redirect after successful login/signup
        }}
      />
    </>
  );
};

export default ProtectedCTA;
