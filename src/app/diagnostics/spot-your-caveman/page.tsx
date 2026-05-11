import Link from "next/link";
import { ArrowRight, ClipboardList, ScanLine } from "lucide-react";

export default function SpotYourCavemanPage() {
  return (
    <main className="bg-white px-6 py-14 font-serif text-brand-dark md:py-20">
      <section className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
        <div>
          <div className="flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
            <span>Quick diagnostic</span>
            <span className="h-px flex-1 bg-brand-dark/15" />
          </div>
          <h1 className="mt-6 text-[clamp(2.45rem,5vw,5rem)] font-bold leading-[0.98] tracking-[-0.03em]">
            This older test
            <br />
            <span className="italic text-brand-accent">has moved.</span>
          </h1>
        </div>

        <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-[0_20px_60px_rgba(4,42,43,0.06)] md:p-8">
          <ClipboardList className="h-7 w-7 text-brand-accent" />
          <p className="mt-5 font-sans text-base leading-8 text-brand-dark/72">
            The deeper Inner Caveman Scan has replaced this quick placeholder.
            It gives a clearer read on instinct patterns and saves the result to
            a dedicated result screen.
          </p>
          <Link
            href="/diagnostics/caveman-scan"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary"
          >
            Start the scan
            <ScanLine className="h-4 w-4" />
          </Link>
          <Link
            href="/diagnostics"
            className="ml-3 mt-6 inline-flex items-center gap-2 rounded-full border border-brand-dark/25 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
          >
            All diagnostics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
