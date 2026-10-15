"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";
  const isAdmin = user?.roles?.includes("admin");

  useEffect(() => {
    if (ready && !isLogin && !isAdmin) router.replace("/admin/login");
    if (ready && isLogin && isAdmin) router.replace("/admin");
  }, [ready, isLogin, isAdmin, router]);

  if (isLogin) return <>{children}</>;
  if (!ready || !isAdmin) {
    return <main className="flex min-h-[70vh] items-center justify-center"><LoaderCircle className="h-6 w-6 animate-spin text-brand-accent" /></main>;
  }

  return (
    <main className="min-h-screen bg-[#f6f5f0] text-brand-dark">
      <header className="border-b border-brand-dark/10 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/admin" className="font-sans text-sm font-bold">Neurocient admin</Link>
          <nav className="flex gap-4 font-sans text-sm font-semibold">
            <Link href="/admin/cohorts">Cohorts</Link>
            <Link href="/admin/payments">Payments</Link>
            <Link href="/admin/audit">Audit</Link>
            <Link href="/profile">My profile</Link>
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}
