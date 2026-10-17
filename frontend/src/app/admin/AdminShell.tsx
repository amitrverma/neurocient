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
      <header className="border-b border-brand-dark/10 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link href="/admin" className="font-sans text-sm font-bold">Neurocient admin</Link>
            <Link href="/profile" className="font-sans text-xs font-semibold text-brand-dark/60 hover:text-brand-primary">My profile</Link>
          </div>
          <nav aria-label="Admin" className="-mx-2 mt-4 flex gap-1 overflow-x-auto px-2 pb-1 font-sans text-sm font-semibold">
            {adminLinks.map((link) => {
              const active = link.href === "/admin" ? pathname === link.href : pathname.startsWith(link.href);
              return <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={`shrink-0 rounded-full px-3 py-2 transition ${active ? "bg-brand-dark text-white" : "text-brand-dark/68 hover:bg-brand-dark/5 hover:text-brand-dark"}`}>{link.label}</Link>;
            })}
          </nav>
        </div>
      </header>
      {children}
    </main>
  );
}

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Accounts" },
  { href: "/admin/newsletter", label: "Communications" },
  { href: "/admin/memberships", label: "Memberships" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/cohorts", label: "Cohorts" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/audit", label: "Audit" },
];
