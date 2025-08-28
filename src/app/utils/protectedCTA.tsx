"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../components/AuthModal";

interface ProtectedCTAProps {
  children: React.ReactNode;
  redirect: string; // where to go after auth
}

const ProtectedCTA = ({ children, redirect }: ProtectedCTAProps) => {
  const { token } = useAuth();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);

  const handleClick = () => {
    if (token) {
      router.push(redirect); // ✅ already logged in
    } else {
      setShowAuth(true); // open modal
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="px-6 py-3 bg-brand-dark text-white rounded-xl hover:bg-brand-accent"
      >
        {children}
      </button>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => {
          setShowAuth(false);
          router.push(redirect); // ✅ redirect after successful login/signup
        }}
      />
    </>
  );
};

export default ProtectedCTA;
