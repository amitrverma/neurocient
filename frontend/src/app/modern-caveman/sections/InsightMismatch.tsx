"use client";

const InsightMismatch = () => {
  return (
    <section className="mc-section mc-section-intro">
      <div className="mc-reading-grid">

        {/* Header */}
        <div className="mc-section-heading">
          <span className="mc-kicker">The mismatch</span>
          <h2>
            When Knowing Isn’t Enough
          </h2>
        </div>

        {/* Highlighted Insight Block */}
        <blockquote className="mc-pullquote">
          <p className="text-lg md:text-xl text-brand-dark/80 leading-relaxed">
            “Maybe it’s not about discipline.
            <br />
            Maybe it’s the belief that if we know better, we’ll do better.
            <br />
            That awareness is enough. That planning is action.”
          </p>

          <p className="text-brand-primary font-semibold text-lg md:text-xl">
            But has it ever really worked that way?
          </p>
        </blockquote>

        {/* Supporting Copy */}
        <div className="mc-prose">
          <p>
            We evolved in a world where knowing meant doing.
            You saw a threat, you ran.  
            The gap between thought and action? Nonexistent.
          </p>

          <p>
            But this world isn’t that world.  
            The threats are vague. The rewards are delayed.  
            And your wiring? Still ancient.
          </p>

          <p className="italic text-brand-dark font-semibold">
            So even when you know better… you scroll, you stall, you spiral.
          </p>
        </div>

      </div>
    </section>
  );
};

export default InsightMismatch;
