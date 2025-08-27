"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
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
        .then(setUser)
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
      .then(setUser)
      .catch(() => logout());
  };

  const logout = () => {
    localStorage.removeItem("jwt");
    setToken(null);
    setUser(null);
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
