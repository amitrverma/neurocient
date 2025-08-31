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
  const [showDropdown, setShowDropdown] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="font-sans w-full fixed top-0 left-0 z-50 border-b border-brand-dark/40 backdrop-blur-sm">
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
          <div className="hidden md:flex items-center space-x-6 font-medium text-brand-dark">
            <Link href="/about" className="hover:text-brand-teal">About</Link>
            <Link href="/resources" className="hover:text-brand-teal">Resources</Link>
            <Link href="/programs" className="hover:text-brand-teal">Programs</Link>

            {/* Auth Section */}
            {user ? (
              <div className="relative">
                {/* Profile Pic Button */}
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex items-center focus:outline-none"
                >
                  <Image
                    src={user?.photoURL ? String(user.photoURL) : "/assets/user.png"}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full border border-brand-dark"
                  />
                </button>

                {/* Dropdown */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border py-2 text-sm">
                    <Link
                      href="/tools"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/saved"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Bookmarks
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-sm font-semibold px-3 py-1 rounded-lg text-brand-dark border border-brand-dark hover:bg-brand-primary hover:border-white hover:text-white transition"
              >
                Sign in
              </button>
            )}

                        {/* Unlock Full Access for logged-in users */}
            {user && (
              <Link
                href="/membership"
                className="text-sm font-semibold px-3 py-1 rounded-lg bg-brand-primary text-white border  hover:bg-brand-teal hover:text-white transition"
              >
                Unlock Full Access
              </Link>
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
        <div className="md:hidden border-t border-brand-dark/40 bg-background/90 backdrop-blur-sm text-brand-dark">
          <div className="flex flex-col px-6 py-4 space-y-4 font-medium">
            <Link href="/about" onClick={() => setIsOpen(false)} className="hover:text-brand-primary">About</Link>
            <Link href="/resources" onClick={() => setIsOpen(false)} className="hover:text-brand-primary">Resources</Link>
            <Link href="/services" onClick={() => setIsOpen(false)} className="hover:text-brand-primary">Services</Link>

            {/* Mobile Auth */}
            {user ? (
              <>
                <Link
                  href="/saved"
                  onClick={() => setIsOpen(false)}
                  className="hover:text-brand-primary"
                >
                  Bookmarks
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="hover:text-brand-primary"
                >
                  Profile
                </Link>
                <Link
                  href="/membership"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-semibold px-3 py-1 rounded-lg  text-brand-dark hover:bg-brand-primary hover:text-white transition"
                >
                  Unlock Full Access
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="text-sm font-semibold px-3 py-1 rounded-lg text-brand-dark hover:bg-brand-primary hover:text-white transition"
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setShowAuth(true);
                  setIsOpen(false);
                }}
                className="text-sm font-semibold px-3 py-1 rounded-lg text-brand-dark hover:bg-brand-primary hover:text-white transition"
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
