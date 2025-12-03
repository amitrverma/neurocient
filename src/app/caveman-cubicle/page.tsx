"use client";

import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useState } from "react";
import AuthModal from "../components/AuthModal";
import {
  Users,
  Brain,
  Compass,
  ChevronRight,
  Phone,
  Mail,
} from "lucide-react";

const CavemanInTheCubicle = () => {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <main className="flex flex-col px-6 py-20 bg-white font-serif">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* ===========================
            HERO
        ============================ */}
        <section className="text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-[#042a2b] leading-tight">
            Caveman in the Cubicle
          </h1>
          <p className="text-lg md:text-xl text-brand-dark/70 max-w-3xl mx-auto leading-relaxed">
            A leadership reset grounded in how people actually behave —  
            not how we wish they did.
          </p>
        </section>

        {/* ===========================
            THE PROBLEM
        ============================ */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold text-[#042a2b]">
            The Problem Most Leadership Training Misses
          </h2>

          <p className="text-brand-dark/70 text-lg leading-relaxed">
            You’ve said all the right things:
          </p>

          <ul className="list-disc pl-6 space-y-2 text-brand-dark/80 text-base">
            <li>“I have an open-door policy.”</li>
            <li>“I want more ownership from my team.”</li>
            <li>“I’m here to support, not micromanage.”</li>
          </ul>

          <p className="text-brand-dark/70 text-lg leading-relaxed">
            And still, teams hesitate. It’s not resistance — it’s wiring.
            Humans evolved to survive hierarchy, protect belonging,  
            and avoid standing out. These ancient instincts still run the show.
          </p>
        </section>

        {/* ===========================
            ANCIENT WIRING
        ============================ */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold text-[#042a2b]">
            Modern Leadership, Ancient Wiring
          </h2>

          <p className="text-brand-dark/70 text-lg">
            You’re not leading spreadsheets. You’re leading brains built 200,000 years ago.
          </p>

          <ul className="list-disc pl-6 space-y-3 text-brand-dark/80 text-base">
            <li>Avoid standing out (conformity bias)</li>
            <li>Defer to authority (even when invited to challenge)</li>
            <li>Protect status & belonging (kills risk-taking)</li>
          </ul>

          <p className="text-brand-dark/70 text-lg leading-relaxed">
            This isn’t a soft-skill problem.
            It’s a human-nature problem — strategy alone can’t fix it.
          </p>
        </section>

        {/* ===========================
            THE SHIFT
        ============================ */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold text-[#042a2b]">
            The Shift: From Insight to X-Ray Vision
          </h2>

          <p className="text-brand-dark/70 text-lg leading-relaxed">
            Most leadership programs tell you what to do.  
            This one explains why what you're doing isn't landing — and what actually works.
          </p>

          <ul className="list-disc pl-6 space-y-3 text-brand-dark/80 text-base">
            <li>Spot the invisible social signals you’re sending</li>
            <li>Decode the instinctive loops behind low ownership</li>
            <li>Shift behaviour using evolutionary psychology — not motivational fluff</li>
          </ul>
        </section>

        {/* ===========================
            PROGRAM OVERVIEW (3 CARD GRID)
        ============================ */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Decision Making */}
          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition space-y-4">
            <Brain className="w-10 h-10 text-[#ed254e]" />
            <h3 className="text-xl font-semibold text-[#042a2b]">
              Decision-Making Pitfalls
            </h3>
            <p className="text-brand-dark/70 text-sm leading-relaxed">
              Why smart people make bad calls — and how optimism, sunk costs,  
              and bias sabotage execution.
            </p>
          </div>

          {/* Team Dynamics */}
          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition space-y-4">
            <Users className="w-10 h-10 text-[#5eb1bf]" />
            <h3 className="text-xl font-semibold text-[#042a2b]">
              Leadership Under the Lens
            </h3>
            <p className="text-brand-dark/70 text-sm leading-relaxed">
              Why what you say doesn’t always land — and how ancient wiring shapes  
              your team's behaviour.
            </p>
          </div>

          {/* Behaviour Design */}
          <div className="p-6 border rounded-2xl shadow-sm hover:shadow-md transition space-y-4">
            <Compass className="w-10 h-10 text-[#a93f55]" />
            <h3 className="text-xl font-semibold text-[#042a2b]">
              Designing for Behaviour
            </h3>
            <p className="text-brand-dark/70 text-sm leading-relaxed">
              Build environments that naturally increase ownership, safety,  
              and initiative.
            </p>
          </div>
        </section>

        {/* ===========================
            DIAGNOSTIC
        ============================ */}
        <section className="space-y-6" id="diagnostic">
          <h2 className="text-2xl md:text-4xl font-bold text-[#042a2b]">
            Spot Your Inner Caveman (Diagnostic)
          </h2>

          <p className="text-brand-dark/70 text-lg">
            A 5-minute leadership diagnostic revealing:
          </p>

          <ul className="list-disc pl-6 space-y-3 text-brand-dark/80 text-base">
            <li>Your instinctive traps under pressure</li>
            <li>How your leadership triggers or calms primal responses</li>
            <li>Where execution and ownership get stuck</li>
          </ul>

          <p className="text-brand-dark/70 italic text-lg">
            Not a personality quiz — a leadership mirror.
          </p>

          <Link
            href="/diagnostics/caveman"
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 text-lg font-semibold rounded-full border text-brand-dark hover:bg-brand-primary hover:text-white transition"
          >
            Try the Diagnostic
            <ChevronRight className="w-5 h-5" />
          </Link>
        </section>

        {/* ===========================
            TAKEAWAYS
        ============================ */}
        <section className="space-y-6">
          <h2 className="text-2xl md:text-4xl font-bold text-[#042a2b]">
            What Leaders Walk Away With
          </h2>

          <ul className="list-disc pl-6 space-y-4 text-brand-dark/80 text-base leading-relaxed">
            <li>X-ray vision for team behaviour</li>
            <li>Bias-aware reflexes for better decisions</li>
            <li>Practical nudges that build trust & initiative</li>
            <li>A personal instinct map for aligned leadership</li>
          </ul>
        </section>

        {/* ===========================
            CONTACT CTA
        ============================ */}
        <section className="text-center space-y-6 py-10">
          <h2 className="text-2xl md:text-4xl font-bold text-[#042a2b]">
            Bring Caveman in the Cubicle to Your Leadership Team
          </h2>

          <p className="text-brand-dark/70 text-lg">
            Start with a conversation. Or begin with the diagnostic.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
            <a
              href="mailto:hello@neurocient.com"
              className="inline-flex items-center gap-2 px-6 py-3 border rounded-full text-brand-dark font-semibold hover:bg-brand-primary hover:text-white transition"
            >
              <Mail className="w-5 h-5" />
              hello@neurocient.com
            </a>

            <a
              href="tel:+918551915656"
              className="inline-flex items-center gap-2 px-6 py-3 border rounded-full text-brand-dark font-semibold hover:bg-brand-primary hover:text-white transition"
            >
              <Phone className="w-5 h-5" />
              +91-85519 15656
            </a>
          </div>
        </section>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </main>
  );
};

export default CavemanInTheCubicle;
