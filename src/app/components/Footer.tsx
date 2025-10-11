"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Linkedin, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-brand-dark/40 py-10 mt-12 font-sans text-sm text-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:justify-between md:items-start gap-8">
        
        {/* 📌 Left: Logo + Legal */}
        <div className="flex flex-col gap-2 max-w-sm">
          <Image
            src="/logo/neurocient.png" // replace with your footer logo
            alt="Neurocient Labs — Inner Caveman"
            width={48}
            height={48}
            className="object-contain"
          />
          <p className="text-xs">
            © {new Date().getFullYear()} Neurocient Labs. All rights reserved.
          </p>
          <p className="text-xs">
            Built with ❤️ and science. See our{" "}
            <Link href="/privacy" className="underline hover:text-brand-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        {/* 📌 Middle: Navigation */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 text-center md:text-left">

          <Link href="/about" className="hover:text-brand-primary underline underline-offset-4">
            About
          </Link>
          <Link href="/inner-caveman" className="hover:text-brand-primary underline underline-offset-4">
            Inner Caveman
          </Link>
          <Link href="/diagnostics" className="hover:text-brand-primary underline underline-offset-4">
            Diagnostics
          </Link>
          <Link href="/contact" className="hover:text-brand-primary underline underline-offset-4">
            Contact
          </Link>
        </div>

        {/* 📌 Right: Social */}
<div className="flex flex-col items-center md:items-end gap-3">
  <p className="font-medium">Stay connected:</p>
  <div className="flex gap-4 text-brand-dark">
    <a
      href="https://x.com/neurocient"
      aria-label="Twitter"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-brand-primary transition"
    >
      <Twitter className="w-5 h-5" />
    </a>
    <a
      href="https://www.linkedin.com/company/neurocient"
      aria-label="LinkedIn"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-brand-primary transition"
    >
      <Linkedin className="w-5 h-5" />
    </a>
    <a
      href="https://www.youtube.com/@neurocient"
      aria-label="YouTube"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-brand-primary transition"
    >
      <Youtube className="w-5 h-5" />
    </a>
    <a
      href="https://www.instagram.com/neurocient/"
      aria-label="Instagram"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-brand-primary transition"
    >
      <Instagram className="w-5 h-5" />
    </a>
  </div>
</div>
      </div>
    </footer>
  );
};

export default Footer;
