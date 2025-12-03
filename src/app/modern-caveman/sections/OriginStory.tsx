"use client";

const OriginStory = () => {
  return (
    <section className="w-full px-6 py-20 bg-white font-serif">
      <div className="max-w-5xl mx-auto space-y-12 text-brand-dark">

        {/* Heading */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold leading-snug">
            Modern world, ancient brain.
            <br />
            That’s the tension.
            <br />
            That’s why I built{" "}
            <span className="text-brand-primary">The Modern Caveman</span>.
          </h2>
        </div>

        {/* Narrative Block */}
        <div className="space-y-6 text-lg leading-relaxed text-brand-dark/80">

          <p>Not because I needed another project.</p>

          <p>
            But because I was done watching smart, self-aware people — including myself —
            loop through the same cycles.
          </p>

          {/* Highlight Box */}
          <div className="bg-brand-teal/10 p-5 md:p-6 rounded-xl space-y-3 border">
            <p>We’d read the books. Watched the TED talks. Saved the motivational quotes.</p>
            <p>We’d tried the new planner, the habit app, the perfect morning routine.</p>
            <p>We’d had the “aha!” moments. The clarity. The conviction.</p>
            <p>And still — the days stayed the same.</p>
          </div>

          <p className="italic text-brand-accent font-medium">
            Not falling apart. But not moving forward either.
            <br />
            Just circling.
          </p>

          <p>
            I lived it too.
            <br />
            The insights would land, loud and clear — and yet I’d fall right back into old loops.
            <br />
            Not because I didn’t care. Not because I didn’t try.
          </p>

          <p className="font-semibold text-brand-dark">
            But because I kept trying to build a new life…
            <br />
            on top of a caveman’s brain.
          </p>

          <p>
            <span className="text-brand-primary font-semibold">The Modern Caveman</span> exists to close the gap —
            <br />
            between what you know and what you actually do.
          </p>

        </div>
      </div>
    </section>
  );
};

export default OriginStory;
