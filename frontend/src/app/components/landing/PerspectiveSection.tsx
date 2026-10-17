import { ArrowRight } from "lucide-react";
import { SectionDecorations, SectionHeading, SectionLabel } from "./LandingShared";

const contrasts = [
  {
    cue: "An uncertain task",
    response: "Delay it until the pressure or the next step becomes clearer.",
  },
  {
    cue: "Someone else moves ahead",
    response: "Check what their progress might mean about your own standing.",
  },
  {
    cue: "A tense conversation ends",
    response: "Replay it so the uncertainty does not disappear before it feels resolved.",
  },
];

export default function PerspectiveSection() {
  return (
    <section className="relative overflow-hidden bg-white px-6 py-16 text-brand-dark md:py-24">
      <SectionDecorations />
      <div className="relative z-10 mx-auto max-w-6xl">
        <SectionLabel>The deeper explanation</SectionLabel>
        <SectionHeading>
          It is not your <span className="italic text-brand-accent">personal failing.</span>
        </SectionHeading>

        <div className="mt-9 grid gap-9 md:mt-12 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:gap-16">
          <p className="font-serif text-3xl font-bold leading-tight text-brand-dark md:text-5xl md:leading-[1.12]">
            The gap between knowing and doing isn&apos;t simply about willpower, discipline, or motivation.
          </p>
          <div className="bg-brand-teal/10 p-6 md:p-8">
            <p className="page-eyebrow text-brand-accent">What happens underneath</p>
            <p className="mt-4 font-sans text-lg leading-8 text-brand-dark/78 md:text-xl md:leading-9">
              Human brains also make fast, automatic judgments about:
            </p>
            <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 font-serif text-xl font-bold leading-7 text-brand-dark md:text-2xl md:leading-8">
              {["effort", "uncertainty", "belonging", "status", "close relationships", "immediate relief"].map((signal) => (
                <li key={signal} className="border-t border-brand-teal/30 pt-3">
                  {signal}
                </li>
              ))}
            </ul>
            <p className="mt-6 font-sans text-base leading-7 text-brand-dark/70 md:text-lg md:leading-8">
              Those judgments can shape what happens before deliberate reasoning catches up.
            </p>
          </div>
        </div>

        <div className="mt-12 border-y border-brand-dark/15 md:mt-16">
          {contrasts.map((item, index) => (
            <article key={item.cue} className="grid gap-3 border-b border-brand-dark/10 py-6 last:border-b-0 md:grid-cols-[2.5rem_0.8fr_auto_1.5fr] md:items-center md:gap-6 md:py-7">
              <span className="font-sans text-xs font-bold tracking-[0.16em] text-brand-dark/35">0{index + 1}</span>
              <p className="font-serif text-xl font-bold text-brand-dark md:text-2xl">{item.cue}</p>
              <ArrowRight className="hidden h-5 w-5 text-brand-teal md:block" aria-hidden="true" />
              <p className="font-sans text-base leading-7 text-brand-dark/70 md:text-lg md:leading-8">{item.response}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-7 border-y border-brand-dark/15 py-9 md:mt-16 md:py-11 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <p className="font-serif text-2xl font-bold leading-9 text-brand-dark md:text-4xl md:leading-tight">
            The response may be automatic. Its effect on your life is{" "}
            <span className="box-decoration-clone bg-brand-secondary/55 px-1.5 py-0.5 text-brand-accent">real.</span>
          </p>
          <p className="max-w-4xl font-sans text-lg leading-8 text-brand-dark/75 md:text-xl md:leading-9">
            Neurocient starts here: not by asking you to try harder, but by helping you see what is shaping the behaviour and then work with it in real situations.
          </p>
        </div>
      </div>
    </section>
  );
}
