"use client";
import { BookOpen, Wrench, ClipboardList, Lock } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import AuthModal from "./AuthModal";

const Resources = () => {
  const { token } = useAuth(); // ✅ check auth
  const [showAuth, setShowAuth] = useState(false);

  // helper to open login modal for protected sections
  const handleProtectedClick = (e: React.MouseEvent) => {
    if (!token) {
      e.preventDefault();
      setShowAuth(true);
    }
  };

  return (
    <main className="flex flex-col px-6 py-20 bg-white font-serif">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Hero / Intro */}
        <section className="text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-[#042a2b]">
            Explore Resources
          </h1>
          <p className="text-lg md:text-xl text-brand-dark/70 max-w-2xl mx-auto leading-relaxed">
            Insights, tools, and diagnostics designed to help you understand your
            caveman wiring — and learn how to work with it.
          </p>
        </section>

        {/* Categories Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Insights & Articles (always open) */}
          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center space-y-4">
            <BookOpen className="w-10 h-10 text-[#ed254e]" />
            <h2 className="text-xl font-semibold text-[#042a2b]">Insights & Articles</h2>
            <p className="text-brand-dark/70 text-sm">
              Short reads explaining how your inner caveman wiring shows up in modern life.
            </p>
            <Link
              href="/insights"
              className="mt-auto px-4 py-2 border text-brand-dark rounded-full text-sm font-semibold hover:bg-[#5eb1bf] hover:text-white transition"
            >
              Explore
            </Link>
          </div>

          {/* Tools & Worksheets (login required) */}
          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center space-y-4">
            <Wrench className="w-10 h-10 text-[#7a2c3d]" />
            <h2 className="text-xl font-semibold text-[#042a2b]">Tools & Worksheets</h2>
            <p className="text-brand-dark/70 text-sm">
              Practical frameworks, worksheets, and habit trackers to help you practice.
            </p>
         <Link
            href={token ? "/tools" : "#"}
            onClick={handleProtectedClick}
            className="mt-auto px-4 py-2 border text-brand-dark rounded-full text-sm font-semibold hover:bg-[#5eb1bf] hover:text-white transition"
          >
            Explore Tools
          </Link>

          </div>

          {/* Diagnostics & Quizzes (open for all) */}
          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center space-y-4">
            <ClipboardList className="w-10 h-10 text-[#5eb1bf]" />
            <h2 className="text-xl font-semibold text-[#042a2b]">Diagnostics & Quizzes</h2>
            <p className="text-brand-dark/70 text-sm">
              Interactive tests to uncover your instinct patterns and caveman triggers.
            </p>
            <Link
              href="/diagnostics"
              className="mt-auto px-4 py-2 border text-brand-dark rounded-full text-sm font-semibold hover:bg-[#5eb1bf] hover:text-white transition"
            >
              Take the Test
            </Link>
          </div>
        </section>

        {/* CTA to Learning Pathways */}
        <div className="mt-12 text-center">
          <p className="text-lg text-brand-dark mb-4">
            Not sure where to start?
          </p>
          <Link
            href="/pathways"
            className="inline-block px-6 py-3 text-lg font-semibold rounded-full border text-brand-dark hover:bg-brand-primary hover:text-white transition"
          >
            Begin with a Guided Path
          </Link>
        </div>
      </div>

      {/* 🔑 Auth Modal */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </main>
  );
};

export default Resources;
