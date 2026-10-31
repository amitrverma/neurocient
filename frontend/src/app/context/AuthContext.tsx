"use client";

import { createContext, useContext, useEffect, useState } from "react";
import posthog from "posthog-js";

interface User {
  id?: string;
  email?: string;
  name?: string;
  roles?: string[];
  membership?: {
    status?: string;
    is_active?: boolean;
    current_period_end?: string | null;
  };
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  logout: (redirect?: boolean) => Promise<void>;
  ready: boolean;
}


const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  // Use the short-lived access cookie first; rotate only after it expires.
  useEffect(() => {
    const initAuth = async () => {
      try {
        let meRes = await fetch("/api/auth/me", { credentials: "include" });

        if (meRes.status === 401) {
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

          if (refreshRes.status === 409) {
            for (const delay of [100, 200, 400, 800, 1600]) {
              await new Promise((resolve) => window.setTimeout(resolve, delay));
              meRes = await fetch("/api/auth/me", { credentials: "include" });
              if (meRes.status !== 401) break;
            }
          }
        }
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
      } finally {
        setReady(true);
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

// inside AuthProvider

const logout = async (redirect: boolean = false) => {
  try {
    const url = redirect
      ? "/api/auth/logout?redirect=true"
      : "/api/auth/logout";

    await fetch(url, {
      method: "POST",
      credentials: "include",
    });
  } finally {
    setUser(null);
    posthog.reset();

    if (redirect) {
      // ensure redirect to landing page
      window.location.href = "/";
    } else {
      // soft refresh to show logged-out state
      window.location.reload();
    }
  }
};


  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
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
