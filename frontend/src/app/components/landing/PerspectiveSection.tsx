import { SectionDecorations, SectionLabel } from "./LandingShared";

export default function PerspectiveSection() {
  return (
      <section className="relative overflow-hidden bg-white text-brand-dark">
        <SectionDecorations flip />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
          <SectionLabel>A Different Perspective on Getting More Life from Life</SectionLabel>
          <h2 className="max-w-5xl text-[clamp(3rem,5.2vw,5.5rem)] font-bold leading-[0.95] tracking-[-0.04em]">
            It is not your <span className="italic text-brand-accent">personal failing.</span>
          </h2>

          <p className="mt-10 max-w-4xl border-l-4 border-brand-secondary pl-6 font-sans text-xl font-semibold leading-8 text-brand-dark/65 md:text-2xl md:leading-10">
            You think your struggles are personal. But many of them come from old
            patterns that were built for a very different world than the one you
            live in today.
          </p>

          <div className="mt-14 max-w-5xl md:ml-auto">
            <p className="font-serif text-2xl font-bold leading-9 md:text-4xl md:leading-tight">
              The world around us has changed dramatically.
            </p>
            <div className="mt-7 grid gap-px bg-brand-dark/12 font-sans sm:grid-cols-3">
              {[
                ["01", "Technology has changed."],
                ["02", "The way we work has changed."],
                ["03", "The way we communicate has changed."],
              ].map(([number, text]) => (
                <div key={number} className="bg-white px-5 py-5">
                  <span className="text-[0.65rem] font-bold tracking-[0.18em] text-brand-teal">{number}</span>
                  <p className="mt-2 font-sans text-base font-semibold leading-7 text-brand-dark md:text-lg md:leading-8">{text}</p>
                </div>
              ))}
            </div>

            <p className="my-10 border-l-4 border-brand-primary py-2 pl-6 font-serif text-2xl font-bold italic leading-9 text-brand-accent md:ml-16 md:text-4xl md:leading-tight">
              But our inner system has not changed at the same pace.
            </p>

            <div className="grid gap-6 border-y border-brand-dark/15 py-8 font-sans text-base leading-8 text-brand-dark/80 md:grid-cols-[1.2fr_.8fr] md:gap-12 md:py-10 md:text-lg md:leading-9">
              <p>
                For most of human history, our ancestors lived in caves, in small
                groups where survival depended on avoiding danger, finding food,
                and staying connected to the tribe.
              </p>
              <p className="font-serif text-2xl font-bold leading-9 text-brand-dark">Those conditions shaped the patterns that still influence us today.</p>
            </div>

            <p className="mt-10 border-l-4 border-brand-secondary pl-6 font-sans text-base leading-8 text-brand-dark/80 md:max-w-4xl md:text-lg md:leading-9">
              Today, comparing, scrolling, worrying, delaying action, and
              overthinking can start to feel like they say something about who
              you are. So you push harder. You try to become more disciplined.
              You blame yourself when nothing changes.
            </p>
          </div>

          <div className="mt-16 max-w-5xl space-y-6 border-t border-brand-dark/20 pt-12 font-sans text-base leading-8 text-brand-dark/80 md:text-lg md:leading-9">
            <div className="space-y-3 font-serif text-[clamp(2.35rem,5vw,5rem)] font-bold leading-[1.02] tracking-[-0.035em] text-brand-dark">
              <p>But what if that&apos;s not the real problem<span className="text-brand-primary">?</span></p>
              <p className="italic text-brand-accent">What if it was never about willpower in the first place?</p>
            </div>
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
              Your brain is{" "}
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

      </section>
  );
}
