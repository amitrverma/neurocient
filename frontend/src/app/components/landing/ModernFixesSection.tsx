import { SectionDecorations, SectionHeading, SectionLabel } from "./LandingShared";

export default function ModernFixesSection() {
  return (
      <section className="relative overflow-hidden bg-brand-dark px-6 py-20 text-white md:py-28">
        <SectionDecorations tone="dark" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <SectionLabel tone="dark">Why modern fixes fall short</SectionLabel>
          <SectionHeading tone="dark">
            You have tried all the
            <span className="italic text-brand-secondary"> modern fixes.</span>
          </SectionHeading>
          <div className="mt-10 max-w-5xl border-l-4 border-brand-secondary pl-5 md:pl-7">
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

          <div className="mt-12 space-y-6 font-sans text-base leading-8 text-white/72">
            <div className="flex flex-col gap-9 border-t border-white/15 py-10 md:gap-12">
              <div className="font-serif text-2xl leading-9 text-white md:text-4xl md:leading-tight">
                <p>And for a while, it does help.</p>
                <ul className="my-6 space-y-3 font-sans text-base font-semibold leading-7 text-white/72 md:text-lg md:leading-8">
                  <li className="flex items-center gap-3"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-teal" />You organize the list.</li>
                  <li className="flex items-center gap-3"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-secondary" />You set the plan.</li>
                  <li className="flex items-center gap-3"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-primary" />You feel a brief sense of control.</li>
                </ul>
                <p className="italic text-white">But it doesn&rsquo;t last.</p>
              </div>
            </div>

            <div className="grid gap-8 py-6 md:grid-cols-3 md:gap-10">
              <div className="border-t-2 border-brand-teal/60 pt-7">
                <h3 className="font-serif text-2xl font-bold text-white">Productivity systems</h3>
                <p>
                  help organize what to do, but it doesn&apos;t explain why the work
                  feels difficult to do in the first place.
                </p>
              </div>
              <div className="border-t-2 border-brand-secondary/60 pt-7">
                <h3 className="font-serif text-2xl font-bold text-white">Motivation hacks</h3>
                <p>
                  Create short bursts of energy. When the initial excitement
                  wears off older patterns take over again.
                </p>
              </div>
              <div className="border-t-2 border-brand-primary/60 pt-7">
                <h3 className="font-serif text-2xl font-bold text-white">Self-discipline advice</h3>
                <p>
                  pushes you to do more. When the willpower runs out you are back
                  to where you started.
                </p>
              </div>
            </div>

            <p>None of these approaches are wrong.</p>
            <p className="pt-4 font-serif text-3xl text-white md:text-4xl">So…why does none of it stick?</p>
            <div className="max-w-5xl border-y border-white/15 py-8 text-white md:py-10">
              <p className="max-w-4xl font-serif text-2xl leading-9 md:text-3xl md:leading-10">
                Because…this approach <strong className="box-decoration-clone bg-brand-secondary px-1.5 py-0.5 text-brand-dark">assumes that once you know better, you will do better.</strong>
              </p>
              <p className="mt-8 border-l-4 border-brand-primary pl-5 font-sans text-lg font-bold leading-8 text-white md:text-xl md:leading-9">
                But that is not how it plays out.
              </p>
            </div>
            <p className="max-w-3xl">
              You can understand exactly what needs to be done, and still feel a
              quiet resistance pulling you away from it.
            </p>
            <div className="max-w-5xl border-y border-white/15 py-8 md:py-10">
              <p className="font-serif text-2xl font-bold leading-9 text-white md:text-3xl md:leading-10">So the cycle repeats.</p>
              <div className="mt-7 grid gap-px overflow-hidden border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
                <p className="bg-brand-dark p-5 font-semibold text-white">You apply the fix.</p>
                <p className="bg-brand-dark p-5 font-semibold text-white">It works briefly.</p>
                <p className="bg-brand-dark p-5 font-semibold text-white">It fades.</p>
                <p className="bg-brand-dark p-5 font-semibold text-white">And slowly, the problem starts to feel like you.</p>
              </div>
            </div>
            <p className="max-w-4xl border-l-4 border-brand-secondary pl-5 font-serif text-2xl leading-9 text-white">
              If this sounds familiar, take a deep breath. You&rsquo;re not alone. And more importantly…
            </p>
          </div>
        </div>
      </section>
  );
}
