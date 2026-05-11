"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/inner-caveman", label: "Inner Caveman" },
  { href: "/diagnostics", label: "Diagnostics" },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  { href: "https://x.com/neurocient", label: "Twitter", icon: Twitter },
  { href: "https://www.linkedin.com/company/neurocient", label: "LinkedIn", icon: Linkedin },
  { href: "https://www.youtube.com/@neurocient", label: "YouTube", icon: Youtube },
  { href: "https://www.instagram.com/neurocient/", label: "Instagram", icon: Instagram },
];

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-brand-dark/12 bg-white px-6 py-10 font-sans text-sm text-brand-dark">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1fr_auto] md:items-start">
        <div className="max-w-sm">
          <Image
            src="/logo/neurocient.png"
            alt="Neurocient Labs"
            width={70}
            height={70}
            className="h-auto object-contain"
          />
          <p className="mt-4 text-xs leading-6 text-brand-dark/64">
            Neurocient Labs helps people notice ancient patterns in modern life
            and design better responses.
          </p>
          <p className="mt-4 text-xs text-brand-dark/54">
            © {new Date().getFullYear()} Neurocient Labs. All rights reserved.
          </p>
        </div>

        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
            Explore
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-semibold transition hover:text-brand-primary"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/privacy" className="font-semibold transition hover:text-brand-primary">
              Privacy
            </Link>
            <Link href="/terms" className="font-semibold transition hover:text-brand-primary">
              Terms
            </Link>
          </div>
        </div>

        <div className="md:text-right">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
            Stay connected
          </p>
          <div className="mt-4 flex gap-3 md:justify-end">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  aria-label={link.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-dark/14 text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
          <p className="mt-5 text-xs leading-6 text-brand-dark/54">
            Built for learning, reflection, and behavior design.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
