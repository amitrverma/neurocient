"use client";

import Link from "next/link";
import { Brain } from "lucide-react";

const DiagnosticsPage = () => {
  return (
    <main className="prose mx-auto p-6">
      <h1 className="text-3xl font-bold mb-12">Diagnostics</h1>

      {/* Intro */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold flex items-baseline gap-3">
          Your Caveman Brain Still Runs the Show
        </h2>
        <p className="mt-4">
          Beneath our modern life, ancient instincts—safety, status, belonging—
          still guide how we think, feel, and act. Our diagnostics help you see
          these instincts clearly and choose where to explore them—your personal
          life or your work life.
        </p>
      </section>
    {/* Separator */}
      <hr className="my-12 border-gray-300" />
      {/* Caveman Scan */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold flex items-baseline gap-3">
          Caveman Scan
          <span className="text-base italic font-normal text-gray-600">
            Quick Personal Insight
          </span>
        </h2>
        <p className="mt-4">
          A 5-minute scan revealing the instincts shaping your daily life.
          Discover how your inner caveman shows up in your habits, emotions, and
          choices.
        </p>
        <div className="mt-4">
          <Link
            href="/diagnostics/caveman-scan"
            className="inline-block border text-brand-dark font-semibold px-6 py-3 rounded-xl shadow hover:bg-brand-primary hover:text-white transition"
          >
            Start Caveman Scan
          </Link>
        </div>
      </section>

      {/* Separator */}
      <hr className="my-12 border-gray-300" />

      {/* CIC Diagnostic */}
      <section>
        <h2 className="text-xl font-semibold flex items-baseline gap-3">
          CIC Diagnostic
          <span className="text-base italic font-normal text-gray-600">
            Workplace Insight
          </span>
        </h2>
        <p className="mt-4">
          A diagnostic tool for leaders and teams to uncover instincts shaping
          workplace dynamics. From status games to conflict avoidance, see how
          ancient wiring drives modern collaboration.
        </p>
        <div className="mt-4">
          <Link
            href="/diagnostics/cic"
            className="inline-block border text-brand-dark font-semibold px-6 py-3 rounded-xl shadow hover:bg-brand-primary hover:text-white transition"
          >
            Start CIC Diagnostic
          </Link>
        </div>
      </section>
    </main>
  );
};

export default DiagnosticsPage;
