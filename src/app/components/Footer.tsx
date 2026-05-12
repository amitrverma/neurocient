"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Twitter, Youtube } from "lucide-react";

const footerGroups = [
  {
    title: "Learn",
    links: [
      { href: "/insights", label: "Insights" },
      { href: "/inner-caveman", label: "Inner Caveman" },
      { href: "/pathways", label: "Pathways" },
      { href: "/books", label: "Books" },
    ],
  },
  {
    title: "Practice",
    links: [
      { href: "/diagnostics", label: "Diagnostics" },
      { href: "/tools", label: "Tools" },
      { href: "/saved", label: "Saved" },
      { href: "/profile", label: "Profile" },
    ],
  },
  {
    title: "Programs",
    links: [
      { href: "/modern-caveman", label: "The Modern Caveman" },
      { href: "/caveman-cubicle", label: "Caveman in the Cubicle" },
      { href: "/programs", label: "All Programs" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/membership", label: "Membership" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
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
  return (
    <footer className="mt-12 border-t border-brand-dark/12 bg-white px-6 py-10 font-sans text-sm text-brand-dark">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.55fr_0.6fr] lg:items-start">
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
            &copy; {new Date().getFullYear()} Neurocient Labs. All rights reserved.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
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

        <div className="lg:text-right">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
            Stay connected
          </p>
          <div className="mt-4 flex gap-3 lg:justify-end">
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
