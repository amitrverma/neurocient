import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SectionDecorations, SectionHeading, SectionLabel } from "./LandingShared";

export default function CavemanScanSection() {
  return (
      <section id="caveman-scan-section" className="relative overflow-hidden bg-brand-dark px-6 py-20 text-white md:py-28">
        <SectionDecorations tone="dark" flip />
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <div className="max-w-5xl">
            <SectionLabel tone="dark">Your starting point</SectionLabel>
            <SectionHeading tone="dark" className="max-w-4xl">
              The Inner Caveman Scan
            </SectionHeading>

            <div className="mt-10 max-w-4xl py-8 md:mt-12 md:py-10">
              <h3 className="max-w-3xl font-serif text-2xl font-bold leading-9 md:text-3xl md:leading-10">It&rsquo;s a quick way to notice what your automatic processing gives weight to in everyday moments.</h3>
              <p className="mt-5 max-w-3xl font-sans text-base leading-8 text-white/70 md:text-lg md:leading-9">
                <strong>It won&apos;t judge you or label you.</strong> It slows those moments down so you can see which signals become important before deliberate thought catches up.
              </p>
            </div>
          </div>

          <div className="mt-10 max-w-4xl md:mt-12">
            <div className="flex flex-wrap gap-x-8 gap-y-3 font-sans text-sm text-white/75 md:text-base">
              <p className="flex items-center gap-3"><Check className="h-4 w-4 shrink-0 text-brand-secondary" />Free.</p>
              <p className="flex items-center gap-3"><Check className="h-4 w-4 shrink-0 text-brand-secondary" />It takes about 5 minutes.</p>
            </div>
            <Link
              href="/diagnostics/caveman-scan"
              className="group mt-8 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-secondary px-8 font-sans text-sm font-bold text-brand-dark outline-none transition hover:bg-white focus-visible:ring-4 focus-visible:ring-brand-teal/60 sm:w-auto"
            >
              Start the Scan
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
  );
}
