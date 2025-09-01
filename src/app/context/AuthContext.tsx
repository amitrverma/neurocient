"use client";

import { createContext, useContext, useEffect, useState } from "react";
import posthog from "posthog-js";

interface User {
  id?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // On mount → try refresh first, then fallback to /me
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 1) Attempt silent refresh (rotates tokens if valid)
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshRes.ok) {
          const data = await refreshRes.json();
          if (data?.user) {
            setUser(data.user);
            if (data.user.id) {
              posthog.identify(data.user.id, {
                email: data.user.email,
                name: data.user.name,
              });
            }
            return;
          }
        }

        // 2) Fallback to /me if refresh didn’t work
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        if (meRes.ok) {
          const u = await meRes.json();
          setUser(u);
          if (u?.id) {
            posthog.identify(u.id, { email: u.email, name: u.name });
          }
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    // After login/signup/firebase-login, cookies are already set
    const res = await fetch("/api/auth/me", { credentials: "include" });
    if (res.ok) {
      const u = await res.json();
      setUser(u);
      if (u?.id) {
        posthog.identify(u.id, { email: u.email, name: u.name });
      }
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      posthog.reset();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
