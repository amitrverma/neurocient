import { SectionDecorations, SectionLabel } from "./LandingShared";

export default function ModernFixesSection() {
  return (
      <section className="relative overflow-hidden bg-brand-dark px-6 py-20 text-white md:py-28">
        <SectionDecorations tone="dark" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <SectionLabel tone="dark">Why modern fixes fall short</SectionLabel>
          <h2 className="max-w-5xl text-[clamp(2.8rem,5vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.035em] text-white">
            To live a life which is more fulfilling, you have tried all the
            <span className="italic text-brand-secondary"> modern fixes.</span>
          </h2>
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
            <div className="grid gap-8 border-y border-white/15 py-10 md:grid-cols-[1.1fr_.9fr] md:items-end md:gap-14">
              <div className="font-serif text-2xl leading-9 text-white md:text-4xl md:leading-tight">
                <p>And for a while, it does help.</p>
                <ul className="my-6 space-y-3 font-sans text-base font-semibold leading-7 text-white/72 md:text-lg md:leading-8">
                  <li className="flex items-center gap-3"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-teal" />You organize the list.</li>
                  <li className="flex items-center gap-3"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-secondary" />You set the plan.</li>
                  <li className="flex items-center gap-3"><span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-primary" />You feel a brief sense of control.</li>
                </ul>
                <p className="italic text-white">But it doesn&rsquo;t last.</p>
              </div>
              <p className="border-l-4 border-brand-primary pl-5 font-serif text-2xl font-bold italic leading-9 text-brand-secondary md:text-3xl md:leading-10">Because the tools are working on the surface.</p>
            </div>

            <div className="grid gap-8 py-6 md:grid-cols-3 md:gap-10">
              <div className="relative border-t-2 border-brand-teal/60 pt-12 before:absolute before:right-0 before:top-2 before:font-serif before:text-5xl before:font-bold before:text-white/10 before:content-['01']">
                <h3 className="font-serif text-2xl font-bold text-white">Productivity systems:</h3>
                <p>
                  Help organize what to do, but it doesn&apos;t explain why the work
                  feels difficult to do in the first place.
                </p>
              </div>
              <div className="relative border-t-2 border-brand-secondary/60 pt-12 md:mt-8 before:absolute before:right-0 before:top-2 before:font-serif before:text-5xl before:font-bold before:text-white/10 before:content-['02']">
                <h3 className="font-serif text-2xl font-bold text-white">Motivation hacks:</h3>
                <p>
                  Create short bursts of energy. When the initial excitement
                  wears off older patterns take over again.
                </p>
              </div>
              <div className="relative border-t-2 border-brand-primary/60 pt-12 md:mt-16 before:absolute before:right-0 before:top-2 before:font-serif before:text-5xl before:font-bold before:text-white/10 before:content-['03']">
                <h3 className="font-serif text-2xl font-bold text-white">Self-discipline advice:</h3>
                <p>
                  Pushes you to do more.  When the willpower runs out you are back
                  to where you started.
                </p>
              </div>
            </div>

            <p className="pt-4 font-serif text-3xl text-white md:text-4xl">Here&apos;s why none of it sticks…</p>
            <div className="max-w-5xl border-y border-white/15 py-8 text-white md:py-10">
              <p className="font-serif text-2xl font-bold leading-9 md:text-4xl md:leading-tight">
                Most advice operates at the level of behaviour.
              </p>
              <div className="mt-7 grid gap-px bg-white/15 font-sans sm:grid-cols-3">
                {[
                  ["01", "What you do"],
                  ["02", "how you do it"],
                  ["03", "how often you do it."],
                ].map(([number, text]) => (
                  <div key={number} className="bg-brand-dark px-5 py-5">
                    <span className="text-[0.65rem] font-bold tracking-[0.18em] text-brand-secondary">{number}</span>
                    <p className="mt-2 text-base font-semibold text-white md:text-lg">{text}</p>
                  </div>
                ))}
              </div>
              <p className="mt-7 border-l-4 border-brand-primary pl-5 font-sans text-lg font-semibold leading-8 text-white/75 md:text-xl md:leading-9">
                It assumes that once you know better, you will do better. But that is not how it plays out.
              </p>
            </div>
            <p className="max-w-3xl">
              You can understand exactly what needs to be done, and still feel a
              quiet resistance pulling you away from it.
            </p>
            <p className="max-w-3xl">
              So the cycle repeats. You apply the fix. It works briefly. It fades.
              And slowly, the problem starts to feel like you.
            </p>
            <p className="max-w-4xl border-l-4 border-brand-secondary pl-5 font-serif text-2xl leading-9 text-white">
              But right here…let&rsquo;s be absolutely clear of ONE thing: it&apos;s not
              YOU.
              <br />
              It&apos;s not your fault.
            </p>
          </div>
        </div>
      </section>
  );
}
