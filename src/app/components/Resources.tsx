// app/components/ResourcesPage.tsx

import { BookOpen, Wrench, ClipboardList, Lock } from "lucide-react";
import Link from "next/link";

const Resources = () => {
  return (
    <main className="flex flex-col px-6 py-20 bg-white font-serif">
      <div className="max-w-6xl mx-auto space-y-20">

        {/* Hero / Intro */}
        <section className="text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-[#042a2b]">
            Explore Resources
          </h1>
          <p className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
            Insights, tools, and diagnostics designed to help you understand your
            caveman wiring — and learn how to work with it.
          </p>
        </section>

        {/* Categories Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Insights & Articles */}
          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center space-y-4">
            <BookOpen className="w-10 h-10 text-[#ed254e]" />
            <h2 className="text-xl font-semibold text-[#042a2b]">Insights & Articles</h2>
            <p className="text-black/70 text-sm">
              Short reads explaining how your inner caveman wiring shows up in modern life.
            </p>
            <a
              href="/insights"
              className="mt-auto px-4 py-2 bg-[#042a2b] text-white rounded-full text-sm font-semibold hover:bg-[#5eb1bf] transition"
            >
              Explore
            </a>
          </div>

          {/* Tools & Worksheets */}
          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center space-y-4">
            <Wrench className="w-10 h-10 text-[#7a2c3d]" />
            <h2 className="text-xl font-semibold text-[#042a2b]">Tools & Worksheets</h2>
            <p className="text-black/70 text-sm">
              Practical frameworks, worksheets, and habit trackers to help you practice.
            </p>
            <a
              href="/tools"
              className="mt-auto px-4 py-2 bg-[#042a2b] text-white rounded-full text-sm font-semibold hover:bg-[#5eb1bf] transition"
            >
              Start Now
            </a>
          </div>

          {/* Diagnostics & Quizzes */}
          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition flex flex-col items-center text-center space-y-4">
            <ClipboardList className="w-10 h-10 text-[#5eb1bf]" />
            <h2 className="text-xl font-semibold text-[#042a2b]">Diagnostics & Quizzes</h2>
            <p className="text-black/70 text-sm">
              Interactive tests to uncover your instinct patterns and caveman triggers.
            </p>
            <a
              href="/diagnostics"
              className="mt-auto inline-flex items-center gap-2 px-4 py-2 bg-[#042a2b] text-white rounded-full text-sm font-semibold hover:bg-[#5eb1bf] transition"
            >
              <Lock className="w-4 h-4" /> Take the Test
            </a>
          </div>
        </section>

        {/* CTA to Learning Pathways */}
<div className="mt-12 text-center">
  <p className="text-lg text-gray-700 mb-4">
    Unsure where to begin? Start with a guided roadmap.
  </p>
  <Link
    href="/learning-pathways"
    className="inline-block px-6 py-3 text-lg font-semibold rounded-full bg-brand-primary text-brand-dark hover:bg-brand-secondary transition"
  >
    Explore Learning Pathways
  </Link>
</div>


        {/* Featured Resource */}
        <section className="p-8 bg-[#f9dc5c]/20 border border-[#f9dc5c] rounded-2xl shadow-md text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#042a2b]">
            🌟 Spot Your Caveman
          </h2>
          <p className="text-lg text-black/80 max-w-2xl mx-auto leading-relaxed">
            Find out which caveman runs your show with our interactive diagnostic quiz.
            Get instant insights — and unlock personalized resources.
          </p>
          <a
            href="/diagnostics/spot-your-caveman"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ed254e] text-white rounded-full text-lg font-semibold hover:bg-[#a93f55] transition"
          >
            <ClipboardList className="w-5 h-5" />
            Take the Quiz
          </a>
        </section>

        {/* Access / Account Section */}
        <section className="text-center space-y-6">
          <p className="text-lg text-black/80">
            Create a free account to unlock diagnostics and save your progress.
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#042a2b] text-white rounded-full text-lg font-semibold hover:bg-[#5eb1bf] transition"
          >
            Sign Up / Log In
          </a>
        </section>
      </div>
    </main>
  );
};

export default Resources;
