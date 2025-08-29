import Link from "next/link";

export default function ProgramPage() {
  return (
    <main className="prose mx-auto p-6">
      <h1 className="text-3xl font-bold mb-12">Our Programs</h1>

      {/* The Modern Caveman */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold flex items-baseline gap-3">
          The Modern Caveman
          <span className="text-base italic font-normal text-gray-600">
            Personal Transformation Program
          </span>
        </h2>
        <p className="mt-4">
          We like to believe we’re modern, rational beings. But beneath the
          surface, our decisions, habits, and emotions are still powered by
          ancient survival wiring — our inner caveman.
        </p>
        <p>
          <strong>The Modern Caveman</strong> is a personal transformation
          program that helps you stop fighting this wiring and start working
          with it. Instead of motivation hacks or fleeting willpower, the
          program offers:
        </p>
        <ul className="list-disc ml-6">
          <li>Diagnostic tools to spot hidden patterns</li>
          <li>A clear framework (IKEA) to move from scattered to centered</li>
          <li>Micro-challenges and nudges for sustainable habits</li>
          <li>Weekly reflections that turn insights into action</li>
        </ul>
        <p className="mt-4">
          It’s not another course you consume. It’s a journey you live through —
          one that rewires how you think, feel, and act in everyday life.
        </p>
        {/* CTA */}
        <div className="mt-6">
          <Link
            href="/modern-caveman"
            className="inline-block border text-brand-dark font-semibold px-6 py-3 rounded-xl shadow hover:bg-brand-primary hover:text-white transition"
          >
            Join the Program
          </Link>
        </div>
      </section>

      {/* Separator */}
      <hr className="my-12 border-gray-300" />

      {/* Caveman in the Cubicle */}
      <section>
        <h2 className="text-2xl font-semibold flex items-baseline gap-3">
          Caveman in the Cubicle
          <span className="text-base italic font-normal text-gray-600">
            Leadership Development Program
          </span>
        </h2>
        <p className="mt-4">
          Modern workplaces run on complex systems, but human behavior inside
          them is still driven by instincts shaped thousands of years ago. That’s
          why meetings go off track, teams fall into groupthink, or decisions get
          delayed — not because people lack skill, but because our inner caveman
          shows up at work too.
        </p>
        <p>
          <strong>Caveman in the Cubicle</strong> is a leadership development
          program that makes these hidden instincts visible and usable. Through
          interactive diagnostics, narrative-driven workshops, and practical
          takeaways, leaders and teams learn to:
        </p>
        <ul className="list-disc ml-6">
          <li>Recognize traps like status games, conflict avoidance, and bias</li>
          <li>Reframe challenges with evolutionary psychology insights</li>
          <li>Translate awareness into better decisions and collaboration</li>
        </ul>
        <p className="mt-4">
          This isn’t corporate “training.” It’s a program that equips leaders to
          manage the human operating system at work — transforming instincts into
          strengths.
        </p>
        {/* CTA */}
        <div className="mt-6">
          <Link
            href="/caveman-cubicle"
            className="inline-block border text-brand-dark font-semibold px-6 py-3 rounded-xl shadow hover:bg-brand-primary hover:text-white transition"
          >
            Request a Workshop
          </Link>
        </div>
      </section>
    </main>
  );
}
