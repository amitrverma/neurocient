import { SectionDecorations, SectionLabel } from "./LandingShared";

export default function PerspectiveSection() {
  return (
      <section className="relative overflow-hidden bg-white text-brand-dark">
        <SectionDecorations />
        <div className="pointer-events-none absolute left-1/2 top-[28rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-brand-secondary/10 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
          <SectionLabel>A Different Perspective on Getting More Life from Life</SectionLabel>
          <h2 className="max-w-5xl text-[clamp(3.25rem,7vw,7rem)] font-bold leading-[0.89] tracking-[-0.055em]">
            It is not your <span className="italic text-brand-accent">personal failing.</span>
          </h2>

          <p className="mt-12 max-w-5xl border-y border-brand-dark/15 py-8 font-serif text-2xl font-bold leading-9 text-brand-dark md:py-10 md:text-4xl md:leading-tight">
            You think your struggles are personal. But many of them come from old
            patterns that were built for a very different world than the one you
            live in today.
          </p>

          <div className="mt-16 max-w-5xl md:mt-20">
            <p className="font-serif text-3xl font-bold leading-10 tracking-[-0.02em] md:text-5xl md:leading-tight">
              The world around us has changed dramatically.
            </p>
            <div className="mt-9 overflow-hidden border-y border-brand-dark/15 font-sans">
              {[
                "Technology has changed.",
                "The way we work has changed.",
                "The way we communicate has changed.",
              ].map((text, index) => (
                <div key={text} className="group flex items-center gap-5 border-b border-brand-dark/12 px-1 py-5 last:border-b-0 md:gap-8 md:py-6">
                  <span className="font-serif text-3xl font-bold italic text-brand-primary/35 transition-colors group-hover:text-brand-primary md:text-4xl">0{index + 1}</span>
                  <p className="text-lg font-semibold leading-8 text-brand-dark md:text-2xl md:leading-9">{text}</p>
                </div>
              ))}
            </div>

            <p className="my-12 max-w-4xl border-l-4 border-brand-primary py-2 pl-6 font-serif text-3xl font-bold italic leading-10 text-brand-accent md:my-16 md:text-5xl md:leading-tight">
              But our inner system has not changed at the same pace.
            </p>

            <div className="relative flex flex-col gap-7 overflow-hidden bg-[#f3eee6] px-6 py-9 font-sans text-base leading-8 text-brand-dark/80 before:absolute before:right-0 before:top-0 before:h-28 before:w-28 before:rounded-bl-full before:border-b before:border-l before:border-brand-dark/10 md:px-10 md:py-12 md:text-lg md:leading-9">
              <p className="max-w-4xl">
                For most of human history, our ancestors lived in caves, in small
                groups where survival depended on avoiding danger, finding food,
                and staying connected to the tribe.
              </p>
              <p className="max-w-4xl border-t border-brand-dark/15 pt-7 font-serif text-2xl font-bold leading-9 text-brand-dark md:text-3xl md:leading-10">Those conditions shaped the patterns that still influence us today.</p>
            </div>

            <p className="mt-12 max-w-4xl border-l-4 border-brand-secondary pl-6 font-sans text-base leading-8 text-brand-dark/80 md:text-lg md:leading-9">
              Today, comparing, scrolling, worrying, delaying action, and
              overthinking can start to feel like they say something about who
              you are. So you push harder. You try to become more disciplined.
              You blame yourself when nothing changes.
            </p>
          </div>

          <div className="mt-20 max-w-5xl space-y-7 border-t border-brand-dark/20 pt-14 font-sans text-base leading-8 text-brand-dark/80 md:mt-28 md:pt-20 md:text-lg md:leading-9">
            <div className="space-y-4 font-serif text-[clamp(2.7rem,6vw,6rem)] font-bold leading-[0.98] tracking-[-0.045em] text-brand-dark">
              <p>But what if that&apos;s not the real problem<span className="text-brand-primary">?</span></p>
              <p className="italic text-brand-accent">What if it was never about willpower in the first place?</p>
            </div>
            <p className="max-w-4xl pt-5">
              These struggles are not signs that something is wrong with you.
              They are old responses that were useful in a very different
              environment and are still running today.
            </p>
            <p className="max-w-4xl">
              In that world, procrastination helped you avoid situations that
              felt risky. Comparison helped you understand where you stood in the
              group. Worrying and overthinking helped you prepare for what could
              go wrong.
            </p>
            <div className="my-12 border-y border-brand-dark/15 py-10 font-serif text-4xl font-bold leading-tight text-brand-dark md:my-16 md:py-12 md:text-6xl">
              <p>These were not weaknesses.</p>
              <p className="italic text-brand-accent">They were survival.</p>
            </div>
            <p className="max-w-4xl">
              The problem is not that you have these patterns. The problem is
              that the world changed and the patterns didn&apos;t.
            </p>
            <p className="max-w-4xl">
              But they are still running. Most of the time, they act before you
              even notice.
            </p>
            <p className="relative my-16 overflow-hidden bg-brand-dark px-6 py-12 font-serif text-[clamp(3rem,6vw,6.25rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-brand-secondary md:px-10 md:py-16">
              Your brain is{" "}
              <span className="italic text-brand-secondary">200,000 years old.</span>
              <br />
              The world you are living in is not.
            </p>
            <p className="max-w-4xl font-serif text-2xl leading-9 text-brand-dark md:text-3xl md:leading-10">
              That is where Neurocient Labs comes in with a different approach.
              Not to fight these patterns, but to understand where they came from
              and learn how to work with them.
            </p>
            <p className="max-w-4xl border-l-4 border-brand-secondary py-1 pl-6 font-bold text-brand-dark">
              Rooted in evolutionary psychology, Neurocient Labs helps you close
              the loop on why you do what you do, why modern fixes fall short,
              and what needs to shift at the source. Then it stays with you, in
              real life, to make sure that change actually happens.
            </p>
            <div className="mt-12 border-t border-brand-dark/15 pt-9 font-serif text-2xl font-bold leading-9 text-brand-dark md:text-4xl md:leading-tight">
              <p>Humans no longer live in caves.</p>
              <p className="mt-2 italic text-brand-accent">But many of the patterns that helped us survive there are still with us today.</p>
            </div>
          </div>
        </div>

      </section>
  );
}
