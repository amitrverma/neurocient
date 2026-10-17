"use client";

import { FormEvent, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("hello@neurocient.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setWorking(true);
    setError("");
    const response = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      setError("The email or password was not accepted.");
      setWorking(false);
      return;
    }
    await login();
    window.location.href = "/admin";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f5f0] px-5 py-16">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl border border-brand-dark/10 bg-white p-7 shadow-sm">
        <p className="page-eyebrow text-brand-teal">Private workspace</p>
        <h1 className="mt-2 text-4xl font-bold">Admin login</h1>
        <p className="mt-3 font-sans text-sm leading-6 text-brand-dark/65">Use the password attached to the configured administrator account.</p>
        <label className="mt-7 block font-sans text-sm font-semibold">Email<input className="mt-2 w-full rounded-lg border border-brand-dark/15 px-4 py-3 font-normal" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label className="mt-4 block font-sans text-sm font-semibold">Password<input className="mt-2 w-full rounded-lg border border-brand-dark/15 px-4 py-3 font-normal" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        {error ? <p className="mt-4 font-sans text-sm text-red-700" role="alert">{error}</p> : null}
        <button disabled={working} className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-dark px-5 py-3 font-sans text-sm font-semibold text-white disabled:opacity-50">
          {working ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{working ? "Signing in" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
