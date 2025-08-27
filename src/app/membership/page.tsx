// app/membership/page.tsx
"use client";

import Link from "next/link";

export default function MembershipPage() {
  return (
    <main className="px-6 py-20 bg-white font-serif">
      <div className="max-w-3xl mx-auto space-y-20">
        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[#042a2b]">
            Invest in Yourself. Unlock Your Caveman Lab.
          </h1>
          <p className="text-lg md:text-xl text-black/70 leading-relaxed max-w-2xl mx-auto">
            Become part of a community that learns how to work with—not against—human nature.
          </p>
          <Link
            href="/subscribe"
            className="inline-block px-8 py-3 text-lg font-semibold rounded-full bg-[#ed254e] text-white hover:bg-[#a93f55] transition"
          >
            Join Membership →
          </Link>
        </section>

        {/* Why Join */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[#042a2b]">Why Join?</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Most self-help tools fail because they fight your wiring. Membership in the Caveman Lab
            gives you practical, science-based ways to understand your instincts, rewire habits, and
            grow alongside others who are on the same path.
          </p>
        </section>

        {/* Benefits */}
        <section className="space-y-10">
          <h2 className="text-3xl font-bold text-[#042a2b]">What You’ll Get</h2>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#042a2b]">Exclusive Insights</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-base">
              <li>Member-only deep-dives beyond free insights</li>
              <li>Frameworks that simplify behavioral science into usable tools</li>
              <li>Weekly reflections designed to sharpen awareness</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#042a2b]">Community & Connection</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-base">
              <li>Private circle of like-minded members</li>
              <li>Thoughtful discussions that spark new ideas</li>
              <li>A safe space to share struggles and experiments</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#042a2b]">Tools & Diagnostics</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-base">
              <li>Unlimited access to interactive diagnostics like <em>Spot Your Caveman</em></li>
              <li>Worksheets and habit trackers that save your progress</li>
              <li>Nudges that meet you where you are</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#042a2b]">The Repository</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-base">
              <li>A growing library of distilled insights from science, psychology, and anthropology</li>
              <li>Searchable and cross-linked for quick access</li>
              <li>Your launchpad for problem-solving and creativity</li>
            </ul>
          </div>
        </section>

        {/* Testimonials */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-[#042a2b] text-center">What Members Say</h2>
          <div className="space-y-6">
            <blockquote className="italic text-lg text-gray-700 text-center max-w-2xl mx-auto">
              “I finally understand why I couldn’t stick with habits. This feels designed for my brain, not against it.”
            </blockquote>
            <p className="text-center font-semibold">— Ritu, Member</p>

            <blockquote className="italic text-lg text-gray-700 text-center max-w-2xl mx-auto">
              “The diagnostic tools are a revelation. They give language to things I’ve felt for years but couldn’t explain.”
            </blockquote>
            <p className="text-center font-semibold">— Anil, Member</p>
          </div>
        </section>

        {/* Plans */}
        <section className="space-y-6 text-center">
          <h2 className="text-3xl font-bold text-[#042a2b]">Membership Plans</h2>
          <p className="text-gray-700">
            Choose how you’d like to support your growth. All plans include full access.
          </p>
          <div className="space-y-4">
            <p className="text-lg font-semibold">₹6,999 / year</p>
            <p className="text-lg font-semibold">₹699 / month</p>
            <p className="text-lg font-semibold">Pay what you want (min. ₹6,999)</p>
          </div>
          <Link
            href="/subscribe"
            className="inline-block mt-4 px-6 py-3 text-lg font-semibold rounded-full bg-[#042a2b] text-white hover:bg-[#5eb1bf] transition"
          >
            Join Now →
          </Link>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-[#042a2b] text-center">FAQ</h2>
          <div className="space-y-4 text-gray-700 text-base max-w-2xl mx-auto">
            <p><strong>Is there a trial?</strong><br />No. Most free insights are already available. Membership is for those who want more.</p>
            <p><strong>Can I cancel?</strong><br />Yes. You can turn off auto-renew anytime.</p>
            <p><strong>Is content shareable?</strong><br />No. Membership content is exclusive to members.</p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[#042a2b]">
            Ready to Align with Your Caveman Wiring?
          </h2>
          <p className="text-lg text-gray-700">
            The smartest investment you can make is in your own growth.
          </p>
          <Link
            href="/subscribe"
            className="inline-block px-8 py-3 text-lg font-semibold rounded-full bg-[#ed254e] text-white hover:bg-[#a93f55] transition"
          >
            Join Membership →
          </Link>
        </section>
      </div>
    </main>
  );
}
