"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Twitter, X, Youtube } from "lucide-react";
import Newsletter from "./Newsletter";

const footerGroups = [
  {
    title: "Start",
    links: [
      { href: "/diagnostics/caveman-scan", label: "Take the Scan" },
    ],
  },
  {
    title: "Understand",
    links: [
      { href: "/inner-caveman", label: "Inner Caveman" },
      { href: "/insights", label: "Insights" },
    ],
  },
  {
    title: "Practice",
    links: [
      { href: "/practice", label: "Guided Practice" },
      { href: "/tools/spots", label: "Spot the Caveman" },
      { href: "/tools/microchallenges", label: "Microchallenges" },
    ],
  },
  {
    title: "Go deeper",
    links: [
      { href: "/modern-caveman", label: "The Modern Caveman" },
      { href: "/caveman-cubicle", label: "Caveman in the Cubicle" },
      { href: "/membership", label: "Membership" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

const socialLinks = [
  { href: "https://x.com/neurocient", label: "Twitter", icon: Twitter },
  { href: "https://www.linkedin.com/company/neurocient", label: "LinkedIn", icon: Linkedin },
  { href: "https://www.youtube.com/@neurocient", label: "YouTube", icon: Youtube },
  { href: "https://www.instagram.com/neurocient/", label: "Instagram", icon: Instagram },
];

const Footer = () => {
  const [newsletterOpen, setNewsletterOpen] = useState(false);

  return (
    <>
    <footer className="mt-12 border-t border-brand-dark/12 bg-white px-6 py-10 font-sans text-sm text-brand-dark">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.72fr_2fr] lg:items-start">
        <div className="max-w-sm">
          <Image
            src="/logo/neurocient.png"
            alt="Neurocient Labs"
            width={70}
            height={70}
            className="h-auto object-contain"
          />
          <p className="mt-4 text-xs leading-6 text-brand-dark/64">
            Neurocient helps people see the automatic responses beneath modern
            struggles and work with them in real life.
          </p>
          <p className="mt-4 text-xs text-brand-dark/54">
            &copy; {new Date().getFullYear()} Neurocient Labs. All rights reserved.
          </p>
          <button
            type="button"
            onClick={() => setNewsletterOpen(true)}
            className="mt-6 cursor-pointer font-semibold underline decoration-brand-dark/25 underline-offset-4 transition hover:text-brand-primary"
          >
            Weekly newsletter
          </button>
          <div className="mt-4 flex gap-3">
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
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-5">
          {footerGroups.map((group) => (
            <div key={group.title}>
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                {group.title}
              </p>
              <div className="mt-4 grid gap-3">
                {group.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="font-semibold transition hover:text-brand-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap gap-x-5 gap-y-2 border-t border-brand-dark/10 pt-6 text-xs text-brand-dark/58">
        <Link href="/privacy" className="font-semibold transition hover:text-brand-primary">
          Privacy
        </Link>
        <Link href="/terms" className="font-semibold transition hover:text-brand-primary">
          Terms
        </Link>
      </div>
    </footer>

    {newsletterOpen && (
      <div
        className="fixed inset-0 z-[80] flex items-center justify-center bg-brand-dark/70 p-4 backdrop-blur-sm"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setNewsletterOpen(false);
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="newsletter-dialog-title"
          className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-lg bg-brand-dark shadow-[0_30px_100px_rgba(0,0,0,0.3)]"
        >
          <button
            type="button"
            onClick={() => setNewsletterOpen(false)}
            aria-label="Close newsletter signup"
            className="absolute right-4 top-4 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-brand-dark text-white transition hover:border-brand-secondary hover:text-brand-secondary"
          >
            <X className="h-5 w-5" />
          </button>
          <span id="newsletter-dialog-title" className="sr-only">
            Weekly Insights newsletter signup
          </span>
          <Newsletter
            variant="feature"
            subtext="Weekly explanations of why familiar behaviours persist, plus practical ways to change the conditions around them. No fluff. No gimmicks. Just science made human."
            logoSrc="/logo/newsletter.png"
          />
        </div>
      </div>
    )}
    </>
  );
};

export default Footer;
