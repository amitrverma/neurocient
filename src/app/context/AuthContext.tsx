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
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwt");
    if (storedToken) {
      setToken(storedToken);
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch user");
          return res.json();
        })
        .then((u) => {
          setUser(u);
          // 🔹 Identify user in PostHog
          if (u?.id) {
            posthog.identify(u.id, {
              email: u.email,
              name: u.name,
            });
          }
        })
        .catch(() => logout());
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("jwt", newToken);
    setToken(newToken);

    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${newToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((u) => {
        setUser(u);
        // 🔹 Identify user in PostHog
        if (u?.id) {
          posthog.identify(u.id, {
            email: u.email,
            name: u.name,
          });
        }
      })
      .catch(() => logout());
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    setToken(null);
    setUser(null);
    // 🔹 Reset PostHog session when logging out
    posthog.reset();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
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
