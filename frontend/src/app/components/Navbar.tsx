"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import { Bell, Bookmark, CreditCard, LogOut, Menu, Settings, ShieldCheck, UserRound, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const navLinks = [
  { href: "/insights", label: "Insights" },
  { href: "/practice", label: "Practice" },
  { href: "/diagnostics", label: "Diagnostics" },
  { href: "/tools", label: "Tools" },
  { href: "/programs", label: "Programs" },
  { href: "/about", label: "About" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);

  const closeMobile = () => setIsOpen(false);
  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  useEffect(() => {
    setIsOpen(false);
    setShowDropdown(false);
  }, [pathname]);

  useEffect(() => {
    if (!showDropdown) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
        accountButtonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showDropdown]);

  return (
    <nav
      aria-label="Primary navigation"
      className="fixed left-0 top-0 z-50 w-full border-b border-brand-dark/12 bg-white/92 font-sans text-brand-dark backdrop-blur-md"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/logo/neurocient.png"
              alt="Neurocient Labs"
              width={104}
              height={42}
              className="h-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden items-center gap-5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`border-b-2 py-1 text-sm font-semibold transition ${
                  isActive(link.href)
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent hover:text-brand-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div ref={accountMenuRef} className="relative">
                <button
                  ref={accountButtonRef}
                  type="button"
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-brand-dark/18 transition hover:border-brand-teal"
                  aria-label="Open account menu"
                  aria-haspopup="true"
                  aria-expanded={showDropdown}
                  aria-controls="account-menu"
                >
                  <Image
                    src={user?.photoURL ? String(user.photoURL) : "/assets/user.png"}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                </button>

                {showDropdown && (
                  <div
                    id="account-menu"
                    role="group"
                    aria-label="Account"
                    className="absolute right-0 mt-3 w-56 rounded-lg border border-brand-dark/12 bg-white p-2 text-sm shadow-[0_20px_60px_rgba(4,42,43,0.14)]"
                  >
                    <div className="border-b border-brand-dark/10 px-3 pb-3 pt-2">
                      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-teal">
                        Signed in
                      </p>
                      <p className="mt-1 truncate font-semibold text-brand-dark">
                        {String(user.name || user.email || "Your account")}
                      </p>
                    </div>
                    <div className="pt-2">
                      <AccountLink
                        href="/profile"
                        icon={<UserRound className="h-4 w-4" />}
                        onClick={() => setShowDropdown(false)}
                      >
                        My home
                      </AccountLink>
                      <AccountLink
                        href="/saved"
                        icon={<Bookmark className="h-4 w-4" />}
                        onClick={() => setShowDropdown(false)}
                      >
                        Saved ideas
                      </AccountLink>
                      <AccountLink
                        href="/membership"
                        icon={<CreditCard className="h-4 w-4" />}
                        onClick={() => setShowDropdown(false)}
                      >
                        Membership
                      </AccountLink>
                      <AccountHashLink
                        href="/profile#preferences"
                        icon={<Bell className="h-4 w-4" />}
                        onClick={() => setShowDropdown(false)}
                      >
                        Preferences
                      </AccountHashLink>
                      <AccountHashLink
                        href="/profile#account"
                        icon={<Settings className="h-4 w-4" />}
                        onClick={() => setShowDropdown(false)}
                      >
                        Account settings
                      </AccountHashLink>
                      {user.roles?.includes("admin") ? (
                        <AccountLink
                          href="/admin"
                          icon={<ShieldCheck className="h-4 w-4" />}
                          onClick={() => setShowDropdown(false)}
                        >
                          Admin
                        </AccountLink>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          setShowDropdown(false);
                          logout(true);
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-left font-semibold transition hover:bg-brand-dark/5"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="cursor-pointer rounded-full border border-brand-dark px-4 py-2 text-sm font-semibold transition hover:bg-brand-dark hover:text-white"
              >
                Sign in
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setShowDropdown(false);
              setIsOpen((prev) => !prev);
            }}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-brand-dark/18 text-brand-dark lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div id="mobile-navigation" className="border-t border-brand-dark/12 bg-white lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4 font-sans text-sm font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`rounded-md px-3 py-3 ${
                  isActive(link.href)
                    ? "bg-brand-dark/5 text-brand-primary"
                    : "hover:bg-brand-dark/5"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <div className="mb-1 mt-3 border-t border-brand-dark/10 px-3 pb-1 pt-4">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-brand-teal">
                    Your account
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-brand-dark">
                    {String(user.name || user.email || "Signed in")}
                  </p>
                </div>
                <Link href="/profile" onClick={closeMobile} className="rounded-md px-3 py-3 hover:bg-brand-dark/5">
                  My home
                </Link>
                <Link href="/saved" onClick={closeMobile} className="rounded-md px-3 py-3 hover:bg-brand-dark/5">
                  Saved ideas
                </Link>
                <Link href="/membership" onClick={closeMobile} className="rounded-md px-3 py-3 hover:bg-brand-dark/5">
                  Membership
                </Link>
                <a href="/profile#preferences" onClick={closeMobile} className="rounded-md px-3 py-3 hover:bg-brand-dark/5">
                  Preferences
                </a>
                <a href="/profile#account" onClick={closeMobile} className="rounded-md px-3 py-3 hover:bg-brand-dark/5">
                  Account settings
                </a>
                {user.roles?.includes("admin") ? (
                  <Link href="/admin" onClick={closeMobile} className="rounded-md px-3 py-3 hover:bg-brand-dark/5">
                    Admin
                  </Link>
                ) : null}
                <button
                  onClick={() => {
                    closeMobile();
                    logout(true);
                  }}
                  className="cursor-pointer rounded-md px-3 py-3 text-left hover:bg-brand-dark/5"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  closeMobile();
                  setShowAuth(true);
                }}
                className="mt-2 cursor-pointer rounded-full border border-brand-dark px-4 py-2 text-left transition hover:bg-brand-dark hover:text-white"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </nav>
  );
};

const AccountLink = ({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <Link
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 rounded-md px-3 py-2 font-semibold transition hover:bg-brand-dark/5"
  >
    {icon}
    {children}
  </Link>
);

const AccountHashLink = ({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) => (
  <a
    href={href}
    onClick={onClick}
    className="flex items-center gap-3 rounded-md px-3 py-2 font-semibold transition hover:bg-brand-dark/5"
  >
    {icon}
    {children}
  </a>
);

export default Navbar;
