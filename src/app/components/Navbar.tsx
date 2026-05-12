"use client";

import { useState } from "react";
import type React from "react";
import { Bookmark, LayoutDashboard, LogOut, Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const navLinks = [
  { href: "/inner-caveman", label: "Inner Caveman" },
  { href: "/resources", label: "Resources" },
  { href: "/programs", label: "Programs" },
  { href: "/about", label: "About" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();

  const closeMobile = () => setIsOpen(false);

  return (
    <nav className="fixed left-0 top-0 z-50 w-full border-b border-brand-dark/12 bg-white/92 font-sans text-brand-dark backdrop-blur-md">
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

          <div className="hidden items-center gap-7 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-semibold transition hover:text-brand-primary"
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-brand-dark/18 transition hover:border-brand-teal"
                  aria-label="Open account menu"
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
                  <div className="absolute right-0 mt-3 w-52 rounded-lg border border-brand-dark/12 bg-white p-2 text-sm shadow-[0_20px_60px_rgba(4,42,43,0.14)]">
                    <AccountLink
                      href="/tools"
                      icon={<LayoutDashboard className="h-4 w-4" />}
                      onClick={() => setShowDropdown(false)}
                    >
                      Dashboard
                    </AccountLink>
                    <AccountLink
                      href="/saved"
                      icon={<Bookmark className="h-4 w-4" />}
                      onClick={() => setShowDropdown(false)}
                    >
                      Saved
                    </AccountLink>
                    <AccountLink
                      href="/profile"
                      icon={<UserRound className="h-4 w-4" />}
                      onClick={() => setShowDropdown(false)}
                    >
                      Profile
                    </AccountLink>
                    <button
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
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-brand-dark/18 text-brand-dark md:hidden"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-brand-dark/12 bg-white md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-4 font-sans text-sm font-semibold">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobile}
                className="rounded-md px-3 py-3 hover:bg-brand-dark/5"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/tools" onClick={closeMobile} className="rounded-md px-3 py-3 hover:bg-brand-dark/5">
                  Dashboard
                </Link>
                <Link href="/saved" onClick={closeMobile} className="rounded-md px-3 py-3 hover:bg-brand-dark/5">
                  Saved
                </Link>
                <Link href="/profile" onClick={closeMobile} className="rounded-md px-3 py-3 hover:bg-brand-dark/5">
                  Profile
                </Link>
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

export default Navbar;
