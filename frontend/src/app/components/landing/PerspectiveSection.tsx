import { SectionLabel, Stat } from "./LandingShared";

export default function PerspectiveSection() {
  return (
      <section className="border-b border-brand-dark/10 bg-white text-brand-dark">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <SectionLabel>A Different Perspective on Getting More Life from Life</SectionLabel>
          <h2 className="max-w-5xl text-[clamp(3.25rem,6vw,6.5rem)] font-bold leading-[0.94] tracking-[-0.045em]">
            It is not your <span className="italic text-brand-accent">personal failing.</span>
          </h2>

          <p className="mt-10 max-w-4xl border-l-4 border-brand-secondary pl-6 font-sans text-xl font-semibold leading-8 text-brand-dark/65 md:text-2xl md:leading-10">
            You think your struggles are personal. But many of them come from old
            patterns that were built for a very different world than the one you
            live in today.
          </p>

          <div className="mt-12 max-w-4xl space-y-6 font-sans text-base leading-8 text-brand-dark/80 md:ml-auto md:text-lg md:leading-9">
            <p>
              The world around us has changed dramatically. Technology has
              changed. The way we work has changed. The way we communicate has
              changed.
            </p>
            <p>But our inner system has not changed at the same pace.</p>
            <p>
              For most of human history, our ancestors lived in caves, in small
              groups where survival depended on avoiding danger, finding food,
              and staying connected to the tribe.
            </p>
            <p>Those conditions shaped the patterns that still influence us today.</p>
            <p>
              Today, comparing, scrolling, worrying, delaying action, and
              overthinking can start to feel like they say something about who
              you are. So you push harder. You try to become more disciplined.
              You blame yourself when nothing changes.
            </p>
          </div>

          <div className="mt-16 max-w-4xl space-y-6 border-t border-brand-dark/20 pt-12 font-sans text-base leading-8 text-brand-dark/80 md:text-lg md:leading-9">
            <p>But what if that&apos;s not the real problem?</p>
            <p>What if it was never about willpower in the first place?</p>
            <p>
              These struggles are not signs that something is wrong with you.
              They are old responses that were useful in a very different
              environment and are still running today.
            </p>
            <p>
              In that world, procrastination helped you avoid situations that
              felt risky. Comparison helped you understand where you stood in the
              group. Worrying and overthinking helped you prepare for what could
              go wrong.
            </p>
            <div className="border-l-4 border-brand-secondary py-1 pl-6 font-serif text-3xl font-bold leading-tight text-brand-dark md:text-5xl">
              <p>These were not weaknesses.</p>
              <p className="italic text-brand-accent">They were survival.</p>
            </div>
            <p>
              The problem is not that you have these patterns. The problem is
              that the world changed and the patterns didn&apos;t.
            </p>
            <p>
              But they are still running. Most of the time, they act before you
              even notice.
            </p>
            <p className="my-14 border-y border-brand-dark/15 py-12 font-serif text-[clamp(3rem,6vw,6.25rem)] font-bold leading-[1.02] tracking-[-0.04em] text-brand-dark">
              Your brain is around{" "}
              <span className="italic text-brand-accent">200,000 years old.</span>
              <br />
              The world you are living in is not.
            </p>
            <p>
              That is where Neurocient Labs comes in with a different approach.
              Not to fight these patterns, but to understand where they came from
              and learn how to work with them.
            </p>
            <p className="border-l-4 border-brand-secondary pl-6 font-bold text-brand-dark">
              Rooted in evolutionary psychology, Neurocient Labs helps you close
              the loop on why you do what you do, why modern fixes fall short,
              and what needs to shift at the source. Then it stays with you, in
              real life, to make sure that change actually happens.
            </p>
            <p>Humans no longer live in caves.</p>
            <p>But many of the patterns that helped us survive there are still with us today.</p>
          </div>
        </div>

        <div className="bg-brand-dark px-6 py-10 text-white md:py-12">
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            <Stat number="5" label="Core survival drives still shaping modern behavior." />
            <Stat number="2x" label="How much stronger losses can feel compared with equivalent gains." />
            <Stat number="95%" label="Of decisions driven by unconscious, automatic processes." />
          </div>
        </div>
      </section>
  );
}
