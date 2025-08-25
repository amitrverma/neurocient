"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="font-sans w-full fixed top-0 left-0 z-50 border-b border-gray-300/40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-brand-secondary">
            <Image
              src="/logo/neurocient.png"
              alt="The Modern Caveman"
              width={100}
              height={100}
              className="object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 font-medium text-background">
            <Link href="/about" className="hover:text-brand-primary">About</Link>
            <Link href="/resources" className="hover:text-brand-primary">Resources</Link>
            <Link href="/diagnostics" className="hover:text-brand-primary">Diagnostics</Link>
            <Link href="/services" className="hover:text-brand-primary">Services</Link>
            <Link href="/contact" className="hover:text-brand-primary">Contact</Link>
              {user && (
            <Link href="/saved" className="hover:text-brand-primary">Bookmarks</Link>
          )}
            {/* Auth Section */}
            {user ? (
              <>
                <span className="text-sm text-gray-600">Hi, {user.email}</span>
                <button
                  onClick={logout}
                  className="text-sm font-semibold px-3 py-1 rounded-lg bg-brand-secondary text-brand-dark hover:bg-brand-primary hover:text-white transition"
                >
                  Log out
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm font-semibold px-3 py-1 rounded-lg bg-brand-secondary text-brand-dark hover:bg-brand-primary hover:text-white transition"
              >
                Sign in
              </button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-300/40 bg-background/90 backdrop-blur-sm text-foreground">
          <div className="flex flex-col px-6 py-4 space-y-4 font-medium">
            <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-brand-primary">About</Link>
            <Link href="/resources" onClick={() => setIsOpen(false)} className="hover:text-brand-primary">Resources</Link>
            <Link href="/diagnostics" onClick={() => setIsOpen(false)} className="hover:text-brand-primary">Diagnostics</Link>
            <Link href="/services" onClick={() => setIsOpen(false)} className="hover:text-brand-primary">Services</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="hover:text-brand-primary">Contact</Link>

            {/* Mobile Auth */}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="text-sm font-semibold px-3 py-1 rounded-lg bg-brand-secondary text-brand-dark hover:bg-brand-primary hover:text-white transition"
              >
                Log out
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowAuth(true);
                  setIsOpen(false);
                }}
                className="text-sm font-semibold px-3 py-1 rounded-lg bg-brand-secondary text-brand-dark hover:bg-brand-primary hover:text-white transition"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </nav>
  );
};

export default Navbar;
