export default function HeroSection() {
  return (
      <section className="relative border-b border-brand-dark/10 bg-white px-6 py-20 md:px-10 md:py-28 lg:py-32">
        <div className="pointer-events-none absolute -right-24 top-16 h-72 w-72 rounded-full border border-brand-teal/15 md:h-[30rem] md:w-[30rem]" />
        <div className="relative mx-auto max-w-6xl text-brand-dark">
          <div className="mb-10 flex items-center gap-3 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-brand-teal">
            <span className="h-px w-10 bg-brand-teal" />
            The Neurocient Labs
          </div>
          <h1 className="max-w-5xl text-[clamp(3.7rem,8vw,7.8rem)] font-bold leading-[0.92] tracking-[-0.055em]">
            You want <strong className="italic text-brand-accent">MORE</strong> from your <span className="italic text-brand-accent">ONE</span> life.
          </h1>

          <p className="mt-10 max-w-3xl border-l-4 border-brand-secondary pl-5 font-sans text-xl font-semibold leading-8 text-brand-dark/75 md:text-2xl md:leading-9">
            We help you understand what&apos;s been{" "}
            <span className="underline decoration-2 underline-offset-4">
              standing in your way.
            </span>
          </p>

          <div className="mt-16 grid max-w-6xl gap-x-16 gap-y-6 border-t border-brand-dark/12 pt-10 font-sans text-base leading-8 md:grid-cols-2 md:text-lg">
            <p>
              Some life experiences make you realize,{" "}
              <strong>clearly and uncomfortably,</strong> that the life you&apos;re
              living and the life you want are not the same.
            </p>
            <p>
              Maybe it was watching someone close struggle with health and
              realizing you don&apos;t want to keep postponing the life you want to
              live.
            </p>
            <p>
              Maybe it was realizing that your close relationships had drifted
              into the bare minimum, where staying in touch had replaced feeling
              connected.
            </p>
            <p>
              Maybe it was realizing you&apos;d started getting triggered by the
              smallest things, like you were under pressure all day, every day.
            </p>
            <p>
              Moments like these have a way of <strong>revealing</strong> patterns
              you can no longer ignore.
            </p>
            <p>
              So you tried. The routines. The fresh starts. You knew exactly what
              to do. And still, the same patterns kept showing up.
            </p>
            <p>
              Constant distraction. Persistent pressure. Endless comparison.
              Delaying what matters. Unceasing guilt. Growing disconnection. Too
              much on your mind.
            </p>
            <p className="border-l-4 border-brand-secondary pl-5 font-bold md:col-span-2 md:max-w-4xl md:text-xl">
              These patterns are not who you are.But then the question you ask
              yourself…
            </p>
          </div>
        </div>
      </section>
  );
}
