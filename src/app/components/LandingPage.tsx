// app/components/LandingPage.tsx
"use client";

import { useEffect, useState } from "react";
import AnimatedWords from "./ui/AnimatedWords";
import Newsletter from "./Newsletter";
import { Brain, Shield, Smartphone, Slash, Cookie, Lightbulb, Book } from "lucide-react";

interface Article {
  slug: string;
  title: string;
  excerpt?: string;
  read_count: number;
}

const LandingPage = () => {
  const year = new Date().getFullYear();
  const [topArticles, setTopArticles] = useState<Article[]>([]);

  useEffect(() => {
    const fetchTop = async () => {
      try {
        const res = await fetch("/api/articles/top");
        if (res.ok) {
          const data = await res.json();
          setTopArticles(data);
        }
      } catch (err) {
        console.error("❌ Failed to load top articles:", err);
      }
    };
    fetchTop();
  }, []);

  return (
    <div className="flex flex-col font-serif bg-white">

      {/* Hero Section */}
      <section className="relative flex flex-col px-6 pb-16">
        <div className="max-w-6xl w-full mx-auto">
          <div className="flex flex-col items-center justify-center text-center gap-4 mt-8">
            {/* Animated words */}
            <div className="w-full flex justify-center">
              <AnimatedWords />
            </div>

            {/* Divider + tagline */}
            <div className="flex flex-col items-center gap-3">
              <span className="h-[2px] w-12 bg-[#042a2b]/60"></span>
              <p className="text-sm md:text-base lg:text-lg text-brand-dark leading-relaxed max-w-xl">
                <i>Your ancient survival programs misfiring in today’s world.</i>
              </p>
            </div>
          </div>

          {/* Reframe */}
          <h2 className="mt-12 text-2xl md:text-4xl lg:text-5xl text-brand-accent leading-snug">
            The struggle isn't your fault. <br /> It's your <span className="underline">wiring.</span>
          </h2>

          {/* Punchline (Primary H1) */}
          <h1 className="mt-12 text-3xl md:text-5xl lg:text-6xl text-brand-dark leading-tight text-right">
            Your <span className="font-extrabold"> Inner Caveman</span> <br/>Still Runs the Show.
          </h1>

          {/* Year line */}
          <p className="text-sm md:text-base lg:text-lg text-brand-accent leading-relaxed italic text-right">
            Yes — even in {year}.
          </p>
        </div>
        
    {topArticles.length > 0 && (
  <div className="mt-20 w-full max-w-5xl mx-auto">
    {/* Top separator */}
    <div className="border-t border-brand-dark pt-8 flex flex-col gap-6">
      {/* Section Heading */}
      <h4 className="text-lg md:text-xl text-brand-accent text-center">
        People are recognizing and working with their Inner Caveman through these articles.
      </h4>

      {/* Cards grid */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {topArticles.map((a) => (
    <a
      key={a.slug}
      href={`/insights/${a.slug}`}
      className="h-[240px] bg-white border border-brand-dark/10 p-6 rounded-xl 
                 shadow-sm hover:shadow-md transition flex flex-col justify-between text-left"
    >
      <div>
        <h5 className="text-brand-dark font-bold text-lg line-clamp-3">
          {a.title}
        </h5>

        {a.excerpt && (
          <p className="text-brand-dark/70 text-sm mt-2 line-clamp-4">
            {a.excerpt}
          </p>
        )}
      </div>

      {/* Read More link */}
      <span className="mt-4 text-brand-primary font-semibold text-sm hover:underline">
        Read More
      </span>
    </a>
  ))}
</div>


      {/* CTA */}
      <p className="mt-4 text-sm md:text-base text-brand-dark text-center">
        Most people try the{" "}
        <a href="/spot" className="font-semibold text-brand-accent hover:underline">
          Spot Your Caveman
        </a>{" "}
        to recognize their hidden patterns — and join a {" "}
        <a href="/microchallenge" className="font-semibold text-brand-accent hover:underline">
          Microchallenge
        </a>{" "}to practice breaking them.
      </p>

      {/* Bottom separator */}
      <div className="border-b border-brand-dark mt-6"></div>
    </div>
  </div>
)}


        <div className="max-w-5xl w-full mx-auto text-center space-y-12 mt-12">
          <h2 className="text-3xl md:text-5xl font-bold text-[#042a2b]">
            But, what is <span className="text-[#ed254e]">Inner Caveman?</span>
          </h2>

          {/* Block 1 */}
          <div className="space-y-3">
            <Brain className="w-10 h-10 mx-auto text-[#7a2c3d]" />
            <p className="text-xl md:text-2xl text-brand-dark/80 leading-snug">
              It’s the ancient brain beneath your modern life.
            </p>
            <p className="text-lg text-brand-dark/60 italic">
              A survival program built for tribes, threats, and scarcity.
            </p>
          </div>

          {/* Block 2 */}
          <div className="space-y-3">
            <Shield className="w-10 h-10 mx-auto text-[#5eb1bf]" />
            <p className="text-xl md:text-2xl text-brand-dark/80 leading-snug">
              Back then, it kept you alive.
            </p>
            <p className="text-lg text-brand-dark/60 italic">
              Today, it misfires.
            </p>
          </div>

          {/* Block 3 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div className="flex flex-col items-center space-y-2">
              <Smartphone className="w-8 h-8 text-[#ed254e]" />
              <p className="text-brand-dark/80">Scroll for approval<br/>instead of rest</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Slash className="w-8 h-8 text-[#ed254e]" />
              <p className="text-brand-dark/80">Avoid conflict<br/>like it’s exile</p>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <Cookie className="w-8 h-8 text-[#ed254e]" />
              <p className="text-brand-dark/80">Crave sugar<br/>when you just need calm</p>
            </div>
          </div>

          {/* Block 4 */}
          <div className="space-y-3">
            <Lightbulb className="w-10 h-10 mx-auto text-[#f9dc5c]" />
            <p className="text-xl md:text-2xl text-brand-dark/80 leading-snug">
              It’s not a flaw. It’s your wiring.
            </p>
          </div>

<div className="mt-12">
  <p className="text-2xl md:text-3xl font-semibold text-[#ed254e] leading-snug">
    Once you see it, you stop fighting yourself —
    <br />
    and start working with it.
    <br />
    <a
      href="/inner-caveman"
      className="block mt-3 text-base md:text-lg font-medium text-[#5eb1bf] hover:text-[#042a2b] transition-colors duration-200"
    >
      Read The Complete Guide to Your Inner Caveman
    </a>
  </p>
</div>

        </div>

        <div className="max-w-5xl mx-auto space-y-20 mt-12">

          {/* Misdiagnosis text only */}
          <div className="text-lg md:text-xl text-[#7a2c3d] leading-relaxed text-center md:text-left">
            We think our struggles are personal flaws. <br />
            We call it procrastination. Distraction. Lack of discipline. <br />
            We try to fix it with more motivation, more grit, more hacks.
          </div>

          {/* Reality with divider */}
          <div className="grid grid-cols-[1fr_auto_2fr] items-center gap-6 md:gap-12">
            <div className="text-2xl md:text-3xl font-semibold text-[#042a2b] text-center md:text-right">
              The Reality
            </div>
            <div className="w-px bg-black/70 mx-auto h-full" />
            <div className="text-lg md:text-xl text-brand-dark/80 leading-relaxed text-center md:text-left">
              It’s the same survival wiring that kept us alive 200,000 years ago. <br />
              Back then, fear, comfort, and social approval meant safety. <br />
              Today, those same instincts misfire — keeping us scrolling, delaying, avoiding.
            </div>
          </div>

          {/* Shift & Next Step */}

          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Right-aligned punchline */}
            <p className="text-2xl md:text-3xl font-semibold text-[#ed254e] text-right">
              Survival got us here. <br />
              Thriving means updating how we work with that wiring.
            </p>

            {/* Site purpose + CTA */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              {/* Left-aligned purpose text */}
              <p className="text-base md:text-xl text-brand-dark/80 leading-relaxed text-left md:w-2/3">
                That’s what this site is built for — <br />
                a place to explore resources, insights, and tools <br />
                so you can stop fighting your caveman brain <br />
                and start working with it.
              </p>

              {/* Right-aligned CTA */}
              <a
                href="/resources"
                className="inline-flex items-center gap-2 px-6 py-3 border text-brand-dark rounded-full text-lg font-semibold hover:bg-[#5eb1bf] hover:text-white transition"
              >
                <Book className="w-5 h-5" />
                Explore Resources
              </a>
            </div>
          </div>
        </div>
      </section>
      <Newsletter
                subtext="Get the weekly email full of insights to help you work with your inner caveman."
                logoSrc="/logo/newsletter.png"
              />
    </div>
  );
};

export default LandingPage;
