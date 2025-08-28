// app/diagnostics/page.tsx
"use client";

import Link from "next/link";
import { Brain } from "lucide-react";

const DiagnosticsPage = () => {
  return (
    <main className="min-h-screen bg-white px-6 py-16">
      <div className="max-w-3xl mx-auto relative">
        {/* Vertical line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 h-full border-l-2 border-brand-dark" />

        {/* Intro */}
        <div className="mb-20 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-brand-dark mb-4">
            Your Caveman Brain Still Runs the Show
          </h1>
          <p className="text-lg text-brand-dark">
            Trace the path of your instincts.  
            At the end, choose where to explore them—your personal life or your work life.
          </p>
        </div>

        {/* Step 1 */}
        <div className="flex justify-center mb-16 relative z-10">
          <div className="bg-yellow-100 rounded-xl p-6 shadow-md w-80 text-center">
            <Brain className="mx-auto h-10 w-10 text-[#ed254e]" />
            <p className="mt-3 text-brand-dark">
              Ancient instincts—safety, status, belonging—still drive modern choices.
            </p>
          </div>
        </div>

        {/* Fork */}
        <div className="flex justify-between items-start mt-20 relative z-10">
          {/* Left Path → Caveman Scan */}
          <Link
            href="/diagnostics/caveman-scan"
            className="w-1/2 pr-6 text-right group"
          >
            <div className="inline-block bg-[#f9dc5c]/30 rounded-xl p-6 shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2 group-hover:text-[#ed254e]">
                🪞 Caveman Scan
              </h2>
              <p className="text-brand-dark text-sm">
                Quick 5-minute scan revealing instincts shaping your daily life.
              </p>
            </div>
          </Link>

          {/* Right Path → CIC Diagnostic */}
          <Link
            href="/diagnostics/cic"
            className="w-1/2 pl-6 text-left group"
          >
            <div className="inline-block bg-[#5eb1bf]/30 rounded-xl p-6 shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2 group-hover:text-[#042a2b]">
                💼 CIC Diagnostic
              </h2>
              <p className="text-brand-dark text-sm">
                Workplace scan to uncover instincts shaping leadership & teamwork.
              </p>
            </div>
          </Link>
        </div>

        {/* Connector lines for fork */}
        <div className="absolute w-full flex justify-between top-[65%]">
          <div className="w-1/2 border-t-2 border-brand-dark mr-4" />
          <div className="w-1/2 border-t-2 border-brand-dark ml-4" />
        </div>
      </div>
    </main>
  );
};

export default DiagnosticsPage;
