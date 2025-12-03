"use client";

import Link from "next/link";

const DiagnosticsPage = () => {
  return (
    <main className="prose prose-brand max-w-4xl mx-auto p-6 font-serif">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-12 text-brand-dark">
        Diagnostics
      </h1>

      {/* Intro */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold flex items-baseline gap-3 text-brand-dark">
          Your Caveman Brain Still Runs the Show
        </h2>
        <p className="mt-4 text-brand-dark/80 leading-relaxed">
          Beneath our modern routines lies the oldest system in your body:
          instinct. Safety, status, and belonging still shape how you think,
          feel, and act. These diagnostics help you see these instincts clearly,
          and explore how they play out in your personal life or your workplace.
        </p>
      </section>

      <hr className="my-12 border-gray-300" />

      {/* Caveman Scan */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold flex items-baseline gap-3 text-brand-dark">
          Caveman Scan
          <span className="text-base italic font-normal text-gray-600">
            Quick Personal Insight
          </span>
        </h2>
        <p className="mt-4 text-brand-dark/80 leading-relaxed">
          A 5-minute personal scan that reveals the instinctive patterns shaping
          your daily habits, emotions, and choices. See how your inner caveman
          shows up in small moments through the day.
        </p>
        <div className="mt-4">
          <Link
            href="/diagnostics/caveman-scan"
            className="inline-block border border-brand-dark text-brand-dark font-semibold px-6 py-3 rounded-xl shadow hover:bg-brand-primary hover:text-white transition"
          >
            Start Caveman Scan
          </Link>
        </div>
      </section>

      <hr className="my-12 border-gray-300" />

      {/* CIC Diagnostic */}
      <section>
        <h2 className="text-xl font-semibold flex items-baseline gap-3 text-brand-dark">
          CIC Diagnostic
          <span className="text-base italic font-normal text-gray-600">
            Workplace Insight
          </span>
        </h2>
        <p className="mt-4 text-brand-dark/80 leading-relaxed">
          A 10-minute diagnostic for leaders and teams to uncover the instincts
          shaping workplace dynamics — from status patterns and conflict
          avoidance to alignment breakdowns and decision loops.
        </p>
        <div className="mt-4">
          <Link
            href="/diagnostics/cic"
            className="inline-block border border-brand-dark text-brand-dark font-semibold px-6 py-3 rounded-xl shadow hover:bg-brand-primary hover:text-white transition"
          >
            Start CIC Diagnostic
          </Link>
        </div>
      </section>
    </main>
  );
};

export default DiagnosticsPage;
