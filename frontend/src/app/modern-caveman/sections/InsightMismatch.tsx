"use client";

const InsightMismatch = () => {
  return (
    <section className="w-full px-6 py-20 bg-white font-serif">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-brand-secondary text-2xl">⚡</span>
          <h2 className="text-2xl md:text-4xl font-bold text-brand-dark leading-tight">
            When Knowing Isn’t Enough
          </h2>
        </div>

        {/* Highlighted Insight Block */}
        <div className="rounded-xl border p-6 bg-brand-teal/10 space-y-4">
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
        </div>

        {/* Supporting Copy */}
        <div className="space-y-6 text-brand-dark/80 text-lg leading-relaxed">
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
