"use client";

const AboutMe = () => {
  return (
    <section className="w-full px-6 py-20 bg-white font-serif">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Heading */}
        <h2 className="text-2xl md:text-4xl font-bold text-brand-dark text-center leading-snug">
          Meet Your Transformation Partner
        </h2>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-brand-dark/70 text-center leading-relaxed mb-6">
          While the world chases AI, pause and consider OI —{" "}
          <strong className="text-brand-primary">Original Intelligence.</strong>
        </p>

        {/* Narrative */}
        <div className="space-y-8 text-lg leading-relaxed text-brand-dark/80">

          <p>
            Not the artificial kind we’re racing to build —  
            but the ancient kind we’ve carried for millions of years.  
            Because that’s the one still running the show.
          </p>

          <p className="font-semibold text-brand-dark text-xl">👋 Hi, I’m Amit.</p>

          <p>
            For 20+ years, I built software, led tech teams, and shipped products
            designed to make life easier.
          </p>

          {/* Credentials List */}
          <div className="space-y-2">
            <p>On paper, I’d checked every box:</p>
            <ul className="list-disc list-inside pl-4">
              <li>
                Engineering from{" "}
                <strong className="text-brand-primary">NIT Warangal</strong>
              </li>
              <li>
                MBA from{" "}
                <strong className="text-brand-primary">IIM Calcutta</strong>
              </li>
              <li>Senior leadership roles in high-growth tech</li>
              <li>A career built on logic, speed, and scale</li>
            </ul>
          </div>

          <p>But something didn’t add up.</p>

          <p>
            I was trained to solve problems with logic.  
            Yet everywhere I looked — people, myself included — acted against their own goals.
          </p>

          <p>
            Teams agreed to change… and fell back into old habits.  
            Friends committed to health, focus, or balance… and still repeated the same loops.
          </p>

          <p className="italic text-brand-accent font-medium">
            We’re not lazy. Not ignorant. Not unwilling.  
            So why do we resist the very things we say we want?
          </p>

          <p>
            That question pulled me into a rabbit hole — through psychology,
            neuroscience, and evolutionary biology. What I found rewired my
            understanding of human behavior:
          </p>

          {/* Quote Block */}
          <blockquote className="border-l-4 border-brand-teal pl-5 italic text-brand-dark/90">
            Our brains were designed for survival, not success.
            <br />
            What kept us alive in the savanna now sabotages us in the boardroom.
            <br />
            Our “flaws”? They’re features — brilliantly tuned for a world that no longer exists.
          </blockquote>

          <p>
            I couldn’t unsee it.  
            So I stepped away from the corporate ladder.
          </p>

          <p>
            Because the real work wasn’t building better tools —  
            it was helping people master the one they already have: their brain.  
            Not by fighting its wiring — but by finally understanding it.
          </p>

          <p>
            Today, I decode the gap between logic and behavior through{" "}
            <strong className="text-brand-primary">The Modern Caveman</strong> —  
            a practical, insight-driven framework to:
          </p>

          {/* Bullet list */}
          <ul className="list-disc list-inside pl-4">
            <li>Pause the autopilot</li>
            <li>Spot your ingrained patterns</li>
            <li>Work with your ancient wiring — not against it</li>
          </ul>

          <p>
            My mission?
            <br />
            To help{" "}
            <strong className="text-brand-primary">100,000 people</strong> upgrade
            their relationship with their own brain —  
            not by “fixing” themselves,  
            but by aligning with their design.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
