"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  Compass,
  Lock,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "./AuthModal";

const primaryResources = [
  {
    title: "Insights & Articles",
    label: "Read",
    text: "Short reads explaining how your Inner Caveman wiring shows up in modern life.",
    href: "/insights",
    cta: "Explore insights",
    icon: BookOpen,
  },
  {
    title: "Diagnostics & Quizzes",
    label: "Notice",
    text: "Interactive tests that help you see instinct patterns, triggers, and everyday loops more clearly.",
    href: "/diagnostics",
    cta: "Take a diagnostic",
    icon: ClipboardList,
  },
  {
    title: "Tools & Worksheets",
    label: "Practice",
    text: "Practical frameworks, habit trackers, and worksheets for turning awareness into repeated action.",
    href: "/tools",
    cta: "Explore tools",
    icon: Wrench,
    protected: true,
  },
];

const startingPoints = [
  {
    title: "Start with the scan",
    text: "A quick way to see how the Inner Caveman shows up in your everyday decisions.",
    href: "/diagnostics/caveman-scan",
  },
  {
    title: "Understand the framework",
    text: "A complete guide to the ancient system still shaping modern behavior.",
    href: "/inner-caveman",
  },
  {
    title: "Follow a guided path",
    text: "A structured route through resources when you want less browsing and more direction.",
    href: "/pathways",
  },
];

const Resources = () => {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const handleProtectedClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowAuth(true);
    }
  };

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>Choose the layer</SectionLabel>
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <h2 className="text-[clamp(2.5rem,4.4vw,4.7rem)] font-bold leading-[0.96] tracking-[-0.03em] text-brand-dark">
              Three ways in.
              <br />
              One system underneath.
            </h2>
            <p className="mt-6 max-w-xl font-sans text-base leading-8 text-brand-dark">
              Read when you want language for the pattern. Run a diagnostic
              when you want to see it in yourself. Use tools when you are ready
              to practice a different response.
            </p>
          </div>

          <div className="border-y border-brand-dark/12">
            {primaryResources.map((item) => {
              const Icon = item.icon;
              const isProtected = item.protected && !user;

              return (
                <Link
                  key={item.title}
                  href={isProtected ? "#" : item.href}
                  onClick={item.protected ? handleProtectedClick : undefined}
                  className="group grid cursor-pointer gap-4 border-b border-brand-dark/12 py-6 transition last:border-b-0 md:grid-cols-[0.62fr_1fr_auto] md:items-center"
                >
                  <div className="flex gap-4">
                    <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                        {item.label}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold leading-tight text-brand-dark">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  <p className="font-sans text-sm leading-7 text-brand-dark/72">
                    {item.text}
                  </p>

                  <span className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent">
                    {isProtected ? <Lock className="h-4 w-4" /> : null}
                    <span className="hidden xl:inline">{item.cta}</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-16 text-white md:py-20">
        <div className="mx-auto max-w-6xl">
          <SectionLabel tone="dark">Where to begin</SectionLabel>
          <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-start">
            <div>
              <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] md:text-5xl">
                Not sure where to start?
              </h2>
              <p className="mt-5 max-w-xl font-sans text-base leading-8 text-white/72">
                Start with awareness, then move toward structure. The resources
                are built to help you notice the old response before you try to
                change it.
              </p>
            </div>

            <div className="space-y-4">
              {startingPoints.map((item, index) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group grid cursor-pointer gap-3 border-l-2 border-brand-secondary py-2 pl-5 transition hover:border-brand-teal"
                >
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-2xl font-bold leading-tight text-white">
                    {item.title}
                  </h3>
                  <p className="font-sans text-sm leading-7 text-white/66">
                    {item.text}
                  </p>
                  <span className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-secondary">
                    Open
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-[0.78fr_1.22fr] md:items-start md:py-16">
        <div>
          <SectionLabel>Guided path</SectionLabel>
          <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
            Less browsing.
            <br />
            More direction.
          </h2>
        </div>

        <Link
          href="/pathways"
          className="group block cursor-pointer rounded-lg border border-brand-dark bg-brand-dark p-6 text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-dark/95 hover:shadow-md md:p-8"
        >
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
            Recommended
          </span>
          <h3 className="mt-3 text-2xl font-normal">Begin with a Guided Path</h3>
          <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-white/68">
            A more structured way to move through the ideas, diagnostics, and
            practices when you want a sequence instead of a library.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-secondary">
            Start the path
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </main>
  );
};

const SectionLabel = ({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) => (
  <div
    className={`mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] ${
      tone === "dark" ? "text-brand-secondary" : "text-brand-teal"
    }`}
  >
    <span>{children}</span>
    <span
      className={`h-px flex-1 ${
        tone === "dark" ? "bg-white/20" : "bg-brand-dark/15"
      }`}
    />
  </div>
);

export default Resources;
