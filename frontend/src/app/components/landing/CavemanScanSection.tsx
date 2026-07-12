import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { SectionDecorations, SectionLabel } from "./LandingShared";

export default function CavemanScanSection() {
  return (
      <section id="caveman-scan-section" className="relative overflow-hidden bg-brand-dark px-6 py-20 text-white md:py-28">
        <SectionDecorations tone="dark" flip />
        <div className="relative z-10 mx-auto w-full max-w-6xl">
          <SectionLabel tone="dark">Inner Caveman Scan</SectionLabel>
          <div className="grid gap-12 md:grid-cols-[1.05fr_.95fr] md:items-start md:gap-16">
            <h2 className="max-w-3xl text-[clamp(3rem,5.2vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.04em] text-white">
              The first step is <span className="italic text-brand-secondary">seeing it in yourself.</span>
            </h2>

            <div className="border-l-4 border-brand-primary pl-6 md:mt-3 md:pl-8">
              <h3 className="text-3xl font-bold md:text-4xl">Inner Caveman Scan</h3>
              <p className="mt-4 max-w-xl font-sans text-base leading-7 text-white/70 md:text-lg md:leading-8">
                It won&apos;t judge you or label you. It’s a quick way to notice which of these survival drives shows up most often in your everyday decisions. It simply gives you a clearer picture of the patterns that may be shaping your thoughts, emotions, and behaviour.
              </p>
            </div>
          </div>

          <div className="mt-14 grid gap-8 border-t border-white/15 pt-9 md:grid-cols-[1fr_auto] md:items-end md:gap-12">
            <div className="grid gap-3 font-sans text-sm text-white/75 sm:grid-cols-3 md:text-base">
              <p className="flex items-center gap-3"><Check className="h-4 w-4 shrink-0 text-brand-secondary" />Free.</p>
              <p className="flex items-center gap-3"><Check className="h-4 w-4 shrink-0 text-brand-secondary" />It takes about 5 minutes.</p>
            </div>
            <Link
              href="/diagnostics/caveman-scan"
              className="group inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-brand-secondary px-7 font-sans text-sm font-bold text-brand-dark outline-none transition hover:bg-white focus-visible:ring-4 focus-visible:ring-brand-teal/60 sm:w-auto"
            >
              Take the Inner Caveman Scan
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
  );
}
