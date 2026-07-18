import { ArrowRight, Brain, ShieldAlert, Users } from "lucide-react";
import { AnimatedApproach } from "./AnimatedApproach";
import { SectionDecorations, SectionHeading } from "./LandingShared";

export default function PerspectiveSection() {
  return (
      <section className="relative overflow-hidden bg-white text-brand-dark">
        <SectionDecorations />
        <div className="relative z-10 mx-auto max-w-6xl px-6 pb-12 pt-12 md:pb-16 md:pt-16">
          <SectionHeading>
            It is not your <span className="italic text-brand-accent">personal failing.</span>
          </SectionHeading>

          <p className="mt-6 max-w-5xl py-4 font-serif text-2xl font-bold leading-9 text-brand-dark md:mt-8 md:py-5 md:text-4xl md:leading-tight">
            You think you are{" "}
            <span className="box-decoration-clone bg-brand-secondary/55 px-1.5 py-0.5 text-brand-accent">flawed.</span>{" "}
            But you are just{" "}
            <span className="underline decoration-brand-teal decoration-double decoration-4 underline-offset-4">human.</span>
          </p>

          <div className="mt-8 max-w-5xl md:mt-10">
            <p className="max-w-5xl font-sans text-xl font-normal leading-[1.5] text-brand-dark md:text-2xl md:leading-[1.45]">
              The gap between knowing and doing isn&apos;t simply about willpower, discipline, or motivation.
            </p>
            <p className="mt-6 max-w-5xl py-4 font-sans text-xl font-normal leading-[1.5] text-brand-dark md:py-5 md:text-2xl md:leading-[1.45]">
              To understand why, we need to go back around{" "}
              <span>200,000 years</span>
            </p>

            <p className="my-8 max-w-4xl border-l-4 border-brand-primary py-2 pl-6 font-serif text-2xl font-bold leading-9 text-brand-accent md:my-10 md:text-3xl md:leading-10">
              For most of modern human history; our ancestors lived in caves, in small groups where survival depended on avoiding danger, finding food, and staying connected to the tribe.
            </p>

            <div className="pb-2 pt-6 text-brand-dark md:pb-3 md:pt-8">
              <p className="max-w-4xl font-serif text-2xl font-bold leading-9 md:text-3xl md:leading-10">
                In that world, every decision carried consequences.
              </p>
              <div className="mt-7 grid gap-6 font-sans text-lg leading-8 text-brand-dark/80 md:grid-cols-3 md:gap-8 md:text-2xl md:leading-[1.45]">
                <p className="border-l-2 border-brand-primary pl-5">Mistaking a predator for the wind could cost you your life.</p>
                <p className="border-l-2 border-brand-secondary pl-5">Being excluded from the tribe could leave you without protection.</p>
                <p className="border-l-2 border-brand-teal pl-5">Missing the chance to eat when food was available meant there was no guarantee of another meal tomorrow.</p>
              </div>

              <div className="mt-9 max-w-5xl font-sans text-lg leading-8 text-brand-dark/80 md:mt-11 md:text-2xl md:leading-[1.45]">
                <p>Over thousands of generations, the human brain adapted to those conditions.</p>
                <p className="mt-5">
                  It became remarkably good at <strong className="text-brand-dark">spotting danger</strong>, remembering negative experiences, <strong className="text-brand-dark">seeking safety</strong>, and repeating behaviours that increased the chances of survival.
                </p>
                <p className="mt-5 font-serif text-2xl font-bold leading-9 text-brand-dark md:text-3xl md:leading-10">
                  The more often those responses helped people survive, the more automatic they became.
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-5xl font-serif text-2xl leading-9 text-brand-dark md:mt-5 md:text-3xl md:leading-10">
              The brain wasn&apos;t trying to make humans happy. It was trying to keep them{" "}
              <strong className="box-decoration-clone bg-brand-secondary/55 px-1.5 py-0.5">alive.</strong>
            </p>
          </div>

          <div className="mt-10 max-w-5xl space-y-5 pt-4 font-sans text-base leading-8 text-brand-dark/80 md:mt-12 md:pt-5 md:text-lg md:leading-9">
            <div className="font-serif font-bold text-brand-dark">
              <p className="max-w-5xl text-balance text-3xl leading-10 tracking-[-0.03em] md:text-4xl md:leading-tight">Today, the world around us has changed dramatically.</p>
              <div className="mt-7 flex flex-col gap-4 font-sans text-lg font-semibold leading-8 md:flex-row md:items-center md:gap-5 md:text-xl">
                <p className="flex-1 text-brand-dark">Technology has changed.</p>
                <ArrowRight className="hidden h-5 w-5 shrink-0 text-brand-primary md:block" aria-hidden="true" />
                <p className="flex-1 text-brand-dark">The way we work has changed.</p>
                <ArrowRight className="hidden h-5 w-5 shrink-0 text-brand-secondary md:block" aria-hidden="true" />
                <p className="flex-1 text-brand-dark">The way we communicate has changed.</p>
              </div>
              <div className="mt-8 flex items-center gap-4" aria-hidden="true">
                <span className="h-3 w-3 shrink-0 rounded-full bg-brand-accent" />
                <span className="h-px w-20 bg-brand-accent/55" />
              </div>
              <p className="mt-4 max-w-5xl text-balance text-3xl italic leading-[1.2] tracking-[-0.025em] text-brand-dark md:text-5xl md:leading-[1.12]">
                But our inner system has not changed at the{" "}
                <span className="relative whitespace-nowrap text-brand-accent after:absolute after:inset-x-0 after:-bottom-1 after:h-1 after:bg-brand-secondary">same pace.</span>
              </p>
            </div>
            <p className="max-w-5xl pt-2 text-xl leading-[1.5] text-brand-dark md:text-2xl md:leading-[1.45]">
              So the brain often responds to modern situations using survival responses shaped for a caveman world.
            </p>
            <div className="relative my-8 max-w-5xl pl-7 md:my-10 md:pl-14">
              <div className="pointer-events-none absolute bottom-10 left-2 top-10 border-l-2 border-dashed border-brand-dark/20 md:left-5" aria-hidden="true" />

              <article className="relative grid rounded-lg border border-brand-dark/15 bg-white shadow-[0_14px_35px_-28px_rgba(4,42,43,0.45)] md:grid-cols-[0.78fr_1.22fr]">
                <span className="absolute -left-[1.65rem] top-12 h-4 w-4 rounded-full border-4 border-white bg-brand-primary md:-left-[2.7rem]" aria-hidden="true" />
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-serif text-4xl text-brand-dark/25">01</span>
                    <ShieldAlert className="h-6 w-6 text-brand-primary" aria-hidden="true" />
                  </div>
                  <p className="mt-5">If a situation felt risky, avoiding it could increase your chances of survival.</p>
                </div>
                <div className="relative border-t border-dashed border-brand-dark/15 p-6 md:border-l md:border-t-0 md:p-8">
                  <p>Today, that same response can show up as putting off difficult conversations, delaying important decisions, or procrastinating on work that feels emotionally uncomfortable.</p>
                </div>
              </article>

              <article className="relative mt-5 grid rounded-lg border border-brand-dark/15 bg-white shadow-[0_14px_35px_-28px_rgba(4,42,43,0.45)] md:grid-cols-[0.78fr_1.22fr]">
                <span className="absolute -left-[1.65rem] top-12 h-4 w-4 rounded-full border-4 border-white bg-brand-secondary md:-left-[2.7rem]" aria-hidden="true" />
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-serif text-4xl text-brand-dark/25">02</span>
                    <Users className="h-6 w-6 text-brand-accent" aria-hidden="true" />
                  </div>
                  <p className="mt-5">If your place in the tribe determined whether you belonged, paying attention to where you stood made sense.</p>
                </div>
                <div className="relative border-t border-dashed border-brand-dark/15 p-6 md:border-l md:border-t-0 md:p-8">
                  <p>Today, that same response can show up as comparing yourself to others, worrying about how you&apos;re perceived, or constantly wondering if you&apos;re falling behind.</p>
                </div>
              </article>

              <article className="relative mt-5 grid rounded-lg border border-brand-dark/15 bg-white shadow-[0_14px_35px_-28px_rgba(4,42,43,0.45)] md:grid-cols-[0.78fr_1.22fr]">
                <span className="absolute -left-[1.65rem] top-12 h-4 w-4 rounded-full border-4 border-white bg-brand-teal md:-left-[2.7rem]" aria-hidden="true" />
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-serif text-4xl text-brand-dark/25">03</span>
                    <Brain className="h-6 w-6 text-brand-teal" aria-hidden="true" />
                  </div>
                  <p className="mt-5">If anticipating danger helped you prepare for what could go wrong, your brain learned to stay alert.</p>
                </div>
                <div className="relative border-t border-dashed border-brand-dark/15 p-6 md:border-l md:border-t-0 md:p-8">
                  <p>Today, that same response can show up as overthinking, worrying, replaying conversations, and imagining problems long before they happen.</p>
                </div>
              </article>
            </div>
            <p className="max-w-4xl">
              These responses made sense back then.
            </p>
            <p className="max-w-4xl">
              The challenge is that your brain is still using these survival responses in today&apos;s modern world that no longer demands them in the same way.
            </p>
            <p className="mt-7 font-serif text-2xl italic leading-9 text-brand-dark/65 md:mt-8 md:text-3xl md:leading-10">
              So…long story short
            </p>
            <p className="mt-5 max-w-5xl text-balance font-serif text-[clamp(2.35rem,7vw,4.5rem)] font-bold italic leading-[1.08] tracking-[-0.035em] text-brand-dark md:mt-6">
              <span className="block">Your brain is around 200,000 years old.</span>
              <span className="mt-1 block">
                The world you are living in is{" "}
                <em className="relative whitespace-nowrap text-brand-accent after:absolute after:inset-x-0 after:-bottom-1 after:h-1 after:bg-brand-secondary">
                  not.
                </em>
              </span>
            </p>
            <p className="max-w-4xl text-brand-dark/80">
              That is where Neurocient Labs comes in with a different approach.
            </p>
            <AnimatedApproach />
            <div className="mt-8 space-y-4 pt-4 text-brand-dark">
              <p>To make lasting change, the first step is awareness.</p>
              <p>Not just of your behaviours, but of what is driving them.</p>
              <p className="pt-2 font-serif text-2xl font-bold leading-9 md:text-4xl md:leading-tight">Let&apos;s take that first step...</p>
            </div>
          </div>
        </div>

      </section>
  );
}
