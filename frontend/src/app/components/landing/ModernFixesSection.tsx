import { SectionLabel } from "./LandingShared";

export default function ModernFixesSection() {
  return (
      <section className="bg-brand-dark px-6 py-20 text-white md:py-28">
        <div className="mx-auto max-w-6xl">
          <SectionLabel tone="dark">Why modern fixes fall short</SectionLabel>
          <h2 className="max-w-5xl text-[clamp(2.8rem,5vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.035em] text-white">
            To live a life which is more fulfilling, you have tried all the
            <span className="italic text-brand-secondary"> modern fixes.</span>
          </h2>
          <p className="mt-8 max-w-4xl border-l-4 border-brand-secondary pl-5 font-sans text-xl font-semibold leading-8 text-white/72 md:text-2xl md:leading-9">
            When something isn&rsquo;t working, the response is almost
            automatic.Try harder. Optimize more. Fix yourself. Build discipline.
            Stay consistent.
          </p>

          <div className="mt-12 space-y-6 font-sans text-base leading-8 text-white/72">
            <p>
              And for a while, it does help. You organize the list. You set the
              plan. You feel a brief sense of control. But it doesn&rsquo;t last.
            </p>
            <p>Because the tools are working on the surface.</p>

            <div className="grid gap-px overflow-hidden rounded-lg border border-white/15 bg-white/15 md:grid-cols-3">
              <div className="bg-brand-dark p-6">
                <h3 className="font-semibold text-white">Productivity systems:</h3>
                <p>
                  Help organize what to do, but it doesn&apos;t explain why the work
                  feels difficult to do in the first place.
                </p>
              </div>
              <div className="bg-brand-dark p-6">
                <h3 className="font-semibold text-white">Motivation hacks:</h3>
                <p>
                  Create short bursts of energy. When the initial excitement
                  wears off older patterns take over again.
                </p>
              </div>
              <div className="bg-brand-dark p-6">
                <h3 className="font-semibold text-white">Self-discipline advice:</h3>
                <p>
                  Pushes you to do more.  When the willpower runs out you are back
                  to where you started.
                </p>
              </div>
            </div>

            <p className="pt-4 font-serif text-3xl text-white md:text-4xl">Here&apos;s why none of it sticks…</p>
            <p className="max-w-4xl border-y border-white/15 py-7 text-lg font-bold leading-8 text-white">
              Most advice operates at the level of behaviour.
              <br />
              What you do, how you do it, how often you do it.  It assumes that
              once you know better, you will do better. But that is not how it
              plays out.
            </p>
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
              YOU. It&apos;s not your fault.
            </p>
          </div>
        </div>
      </section>
  );
}
