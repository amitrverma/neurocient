import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionLabel } from "./LandingShared";

export default function CavemanScanSection() {
  return (
      <section className="bg-brand-dark px-6 py-20 text-white md:py-28">
        <div className="mx-auto grid w-full max-w-6xl gap-12 md:grid-cols-[0.85fr_1.15fr] md:items-start">
        <div>
          <SectionLabel tone="dark">Inner Caveman Scan</SectionLabel>
          <h2 className="max-w-xl text-[clamp(3rem,5vw,5.5rem)] font-bold leading-[0.96] tracking-[-0.04em] text-white">
            The next step is to see this in yourself.
          </h2>
        </div>
        <Link
          href="/diagnostics/caveman-scan"
          className="group block w-full rounded-lg border border-white/20 bg-white/[0.05] p-7 text-white transition duration-300 hover:-translate-y-1 hover:border-brand-secondary/60 hover:bg-white/[0.08] md:justify-self-end md:p-10"
        >
          <span className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
            Free tool
          </span>
          <h3 className="mt-4 text-3xl font-bold">Inner Caveman Scan</h3>
          <p className="mt-3 font-sans text-sm leading-7 text-white/65">
            A quick way to notice how this system shows up in your everyday decisions.
          </p>
          <p className="mt-4 font-sans text-sm leading-7 text-white/65">
            Not a test. Not a label.
            <br />
            Just a clearer view of what&apos;s already happening.
          </p>
          <span className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-secondary px-5 py-3 font-sans text-sm font-semibold text-brand-dark transition group-hover:gap-3">
            Go to the scan
            <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
        </div>
      </section>
  );
}
