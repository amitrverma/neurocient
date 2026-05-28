import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ClipboardList, ScanLine } from "lucide-react";
import type { ReactNode } from "react";

const diagnostics = [
  {
    title: "Inner Caveman Scan",
    label: "Personal insight",
    duration: "A few short scenarios",
    text: "See how your Inner Caveman shows up in everyday decisions: procrastination, hesitation, distraction, and emotional loops.",
    href: "/diagnostics/caveman-scan",
    cta: "Start the scan",
    icon: ScanLine,
    featured: true,
  },
  {
    title: "CIC Diagnostic",
    label: "Workplace insight",
    duration: "10 minutes",
    text: "Uncover the instincts shaping workplace dynamics, from status patterns and conflict avoidance to alignment breakdowns and decision loops.",
    href: "/diagnostics/cic",
    cta: "Start CIC diagnostic",
    icon: BriefcaseBusiness,
  },
];

export default function DiagnosticsPage() {
  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:py-20">
        <SectionLabel>Diagnostics</SectionLabel>

        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
          <div>
            <h1 className="text-[clamp(2.6rem,5vw,5.35rem)] font-bold leading-[0.98] tracking-[-0.03em] text-brand-dark">
              See the pattern
              <br />
              <span className="italic text-brand-accent">while it is happening.</span>
            </h1>
            <p className="mt-6 max-w-xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark">
              Safety, status, and belonging still shape how you think, feel, and
              act. These diagnostics help you see those instincts more clearly.
            </p>
          </div>

          <div className="border-y border-brand-dark/12">
            {diagnostics.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={`group grid cursor-pointer gap-5 border-b border-brand-dark/12 py-7 transition last:border-b-0 md:grid-cols-[0.62fr_1fr_auto] md:items-center ${
                    item.featured ? "md:py-8" : ""
                  }`}
                >
                  <div className="flex gap-4">
                    <span
                      className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                        item.featured
                          ? "border-brand-secondary bg-brand-dark text-brand-secondary"
                          : "border-brand-teal/35 text-brand-accent"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                        {item.label}
                      </p>
                      <h2 className="mt-2 text-2xl font-bold leading-tight text-brand-dark md:text-3xl">
                        {item.title}
                      </h2>
                      <p className="mt-2 font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-dark/45">
                        {item.duration}
                      </p>
                    </div>
                  </div>

                  <p className="font-sans text-sm leading-7 text-brand-dark/72">
                    {item.text}
                  </p>

                  <span className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent">
                    <span className="hidden xl:inline">{item.cta}</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-brand-dark px-6 py-14 text-white md:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.78fr_1.22fr] md:items-start">
          <div>
            <SectionLabel tone="dark">How to use them</SectionLabel>
            <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] md:text-4xl">
              Not a label.
              <br />
              A clearer read.
            </h2>
          </div>

          <div className="grid gap-5 font-sans text-base leading-8 text-white/72 md:grid-cols-3">
            <p>
              Answer from instinct. The useful signal is the response you would
              actually have, not the one you think sounds best.
            </p>
            <p>
              Read the reflection. Each result names what the response may be
              trying to protect, seek, or avoid.
            </p>
            <p>
              Use it as awareness. Diagnostics are a starting point for
              noticing patterns earlier, not a fixed identity.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-14 md:grid-cols-[0.78fr_1.22fr] md:items-start md:py-16">
        <div>
          <SectionLabel>Another view</SectionLabel>
          <h2 className="text-3xl font-bold leading-tight text-brand-dark md:text-4xl">
            Prefer the older quick test?
          </h2>
        </div>

        <Link
          href="/diagnostics/spot-your-caveman"
          className="group block cursor-pointer rounded-lg border border-brand-dark/10 bg-white p-6 shadow-sm transition hover:border-brand-teal/60 hover:shadow-md md:p-7"
        >
          <span className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
            <ClipboardList className="h-4 w-4" />
            Quick diagnostic
          </span>
          <h3 className="mt-3 text-2xl font-bold leading-tight text-brand-dark">
            Spot Your Caveman
          </h3>
          <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-brand-dark/72">
            A shorter entry point for noticing instinctive patterns before
            moving into the deeper scan.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent">
            Open quick test
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </section>
    </main>
  );
}

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
