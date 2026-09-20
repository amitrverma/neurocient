import { SectionDecorations, SectionHeading, SectionLabel } from "./LandingShared";

export default function ModernFixesSection() {
  return (
      <section className="relative overflow-hidden bg-brand-dark px-6 pb-12 pt-14 text-white md:pb-16 md:pt-18">
        <SectionDecorations tone="dark" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <SectionLabel tone="dark">The usual response</SectionLabel>
          <SectionHeading tone="dark">
            You have tried all the
            <span className="italic text-brand-secondary"> modern fixes.</span>
          </SectionHeading>
          <div className="mt-12 max-w-4xl border-l-4 border-brand-secondary pl-5 md:pl-7">
            <p className="font-sans text-lg font-semibold leading-8 text-white/72 md:text-2xl md:leading-9">
              When something isn&rsquo;t working, the response is almost automatic.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 font-sans text-sm font-bold md:text-base">
              {["Try harder.", "Optimize more.", "Fix yourself.", "Build discipline.", "Stay consistent."].map((fix, index) => (
                <span key={fix} className={`border px-3 py-2 ${index === 2 ? "border-brand-primary/70 text-brand-primary" : "border-white/20 text-white"}`}>
                  {fix}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 font-sans text-base leading-8 text-white/72">
            <div className="py-3">
              <div className="font-serif text-2xl leading-9 text-white md:text-4xl md:leading-tight">
                <p>And for a while, it does help.</p>
                <p className="my-6 max-w-4xl font-sans text-lg font-semibold leading-8 text-white/72 md:text-2xl md:leading-9">
                  You organize the list. You set the plan. You feel a brief sense of control.
                </p>
                <p className="italic text-brand-primary">But it doesn&rsquo;t last.</p>
              </div>
            </div>

            <div className="mt-2 grid max-w-5xl gap-7 py-3 md:mt-3 md:gap-8 md:py-4">
              <div className="border-b-2 border-brand-teal/60 pb-7">
                <h3 className="font-serif text-2xl font-bold text-white">Productivity systems</h3>
                <p className="mt-2 text-lg leading-8 md:text-xl md:leading-9">
                  help organize what to do, but it doesn&apos;t explain why the work
                  feels difficult to do in the first place.
                </p>
              </div>
              <div className="border-b-2 border-brand-secondary/60 pb-7">
                <h3 className="font-serif text-2xl font-bold text-white">Motivation hacks</h3>
                <p className="mt-2 text-lg leading-8 md:text-xl md:leading-9">
                  Create short bursts of energy. When the initial excitement
                  wears off older patterns take over again.
                </p>
              </div>
              <div className="border-b-2 border-brand-primary/60 pb-7">
                <h3 className="font-serif text-2xl font-bold text-white">Self-discipline advice</h3>
                <p className="mt-2 text-lg leading-8 md:text-xl md:leading-9">
                  pushes you to do more. When the willpower runs out you are back
                  to where you started.
                </p>
              </div>
            </div>

            <p className="mt-5 text-lg leading-8 md:text-2xl md:leading-9">None of these approaches are wrong.</p>
            <p className="mt-3 font-serif text-3xl text-white md:text-4xl">So…why does none of it stick?</p>
            <div className="mt-8 max-w-5xl py-6 text-white md:mt-10 md:py-7">
              <p className="max-w-5xl font-serif text-2xl leading-9 md:whitespace-nowrap md:text-3xl md:leading-10">
                Because…they assume that <strong className="box-decoration-clone bg-brand-secondary px-1.5 py-0.5 text-brand-dark">once you know better, you will do better.</strong>
              </p>
              <p className="mt-8 border-l-4 border-brand-primary pl-5 font-sans text-lg font-bold leading-8 text-white md:text-xl md:leading-9">
                But that is not how it plays out.
              </p>
            </div>
            <p className="mt-4 max-w-5xl text-lg leading-8 md:text-2xl md:leading-9">
              You can understand exactly what needs to be done, and still feel a
              quiet resistance pulling you away from it.
            </p>
            <div className="mt-6 max-w-5xl py-6 md:py-8">
              <p className="font-serif text-2xl font-bold leading-9 text-white md:text-3xl md:leading-10">So the cycle repeats.</p>
              <ol className="relative mx-auto mt-8 aspect-square w-full max-w-md font-sans text-sm font-semibold text-white sm:text-base">
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 320" fill="none" aria-hidden="true">
                  <defs>
                    <marker id="cycle-arrow-teal" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#5eb1bf" /></marker>
                    <marker id="cycle-arrow-yellow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#f9dc5c" /></marker>
                    <marker id="cycle-arrow-red" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0L8 4L0 8Z" fill="#ed254e" /></marker>
                  </defs>
                  <path className="landing-cycle-arc landing-cycle-arc-1" pathLength="1" d="M160 24A136 136 0 0 1 278 228" stroke="#5eb1bf" strokeWidth="2" markerEnd="url(#cycle-arrow-teal)" />
                  <path className="landing-cycle-arc landing-cycle-arc-2" pathLength="1" d="M274 236A136 136 0 0 1 48 237" stroke="#f9dc5c" strokeWidth="2" markerEnd="url(#cycle-arrow-yellow)" />
                  <path className="landing-cycle-arc landing-cycle-arc-3" pathLength="1" d="M42 228A136 136 0 0 1 104 50" stroke="#ed254e" strokeWidth="2" markerEnd="url(#cycle-arrow-red)" />
                </svg>
                <li className="landing-cycle-label landing-cycle-label-1 absolute left-1/2 top-3 w-44 -translate-x-1/2 bg-brand-dark px-3 py-1 text-center">
                  <span className="mr-2 text-brand-primary">01</span>You apply the fix.
                </li>
                <li className="landing-cycle-label landing-cycle-label-2 absolute bottom-[21%] right-0 w-44 bg-brand-dark px-3 py-1 text-center sm:right-1">
                  <span className="mr-2 text-brand-teal">02</span>It works briefly.
                </li>
                <li className="landing-cycle-label landing-cycle-label-3 absolute bottom-[27%] left-3 w-36 bg-brand-dark px-3 py-1 text-center sm:left-5">
                  <span className="mr-2 text-brand-secondary">03</span>It fades.
                </li>
              </ol>
              <p className="mx-auto mt-8 max-w-4xl text-center font-serif text-2xl font-bold leading-9 text-white md:text-3xl md:leading-10">
                And slowly, the problem starts to feel like you.
              </p>
            </div>
            <p className="mt-6 max-w-4xl font-serif text-2xl leading-9 text-white">
              If this sounds familiar, take a deep breath. You&rsquo;re not alone. And more importantly…
            </p>
          </div>
        </div>
      </section>
  );
}
