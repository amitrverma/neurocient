import { Brain, ShieldAlert, Users } from "lucide-react";
import { SectionDecorations, SectionHeading, SectionLabel } from "./LandingShared";

export default function PerspectiveSection() {
  return (
      <section className="relative overflow-hidden bg-white text-brand-dark">
        <SectionDecorations />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
          <SectionLabel>A Different Perspective on Getting More Life from Life</SectionLabel>
          <SectionHeading>
            It is not your <span className="italic text-brand-accent">personal failing.</span>
          </SectionHeading>

          <p className="mt-12 max-w-5xl py-8 font-serif text-2xl font-bold leading-9 text-brand-dark md:py-10 md:text-4xl md:leading-tight">
            You think you are flawed. But you are human.
          </p>

          <div className="mt-16 max-w-5xl md:mt-20">
            <p className="max-w-4xl font-serif text-2xl font-bold leading-9 tracking-[-0.02em] md:text-3xl md:leading-10">
              The gap between knowing and doing isn&apos;t simply about willpower, discipline, or motivation.
            </p>
            <div className="mt-9 flex flex-col justify-between gap-5 py-7 md:flex-row md:items-end md:py-9">
              <p className="max-w-md font-sans text-lg font-semibold leading-8 text-brand-dark md:text-xl md:leading-9">To understand why, we need to go back around</p>
              <p className="font-serif text-[clamp(3rem,7vw,6rem)] font-bold italic leading-none tracking-[-0.05em] text-brand-primary">200,000 years</p>
            </div>

            <p className="my-12 max-w-4xl border-l-4 border-brand-primary py-2 pl-6 font-serif text-2xl font-bold leading-9 text-brand-accent md:my-16 md:text-3xl md:leading-10">
              For most of human history, our ancestors lived in caves, in small groups where survival depended on avoiding danger, finding food, and staying connected to the tribe.
            </p>

            <div className="relative flex flex-col gap-7 overflow-hidden px-0 py-9 font-sans text-base leading-8 text-brand-dark/80 md:py-12 md:text-lg md:leading-9">
              <p className="max-w-4xl">
                In that world, every decision carried consequences. Mistaking a predator for the wind could cost you your life. Being excluded from the tribe could leave you without protection. Missing the chance to eat when food was available meant there was no guarantee of another meal tomorrow.
              </p>
              <p className="max-w-4xl">Over thousands of generations, the human brain adapted to those conditions. It became remarkably good at spotting danger, remembering negative experiences, seeking safety, and repeating behaviours that increased the chances of survival. The more often those responses helped people survive, the more automatic they became.</p>
            </div>

            <p className="mt-12 max-w-4xl font-sans text-base leading-8 text-brand-dark/80 md:text-lg md:leading-9">
              The brain wasn&apos;t trying to make humans happy. It was trying to keep them alive.
            </p>
          </div>

          <div className="mt-20 max-w-5xl space-y-7 border-t border-brand-dark/20 pt-14 font-sans text-base leading-8 text-brand-dark/80 md:mt-28 md:pt-20 md:text-lg md:leading-9">
            <div className="font-serif font-bold text-brand-dark">
              <p className="max-w-5xl text-balance text-3xl leading-10 tracking-[-0.03em] md:text-4xl md:leading-tight">Today, the world around us has changed dramatically.</p>
              <div className="mt-8 grid gap-px overflow-hidden border border-brand-dark/15 bg-brand-dark/15 font-sans text-base font-semibold md:grid-cols-3 md:text-lg">
                <p className="bg-white p-5">Technology has changed.</p>
                <p className="bg-white p-5">The way we work has changed.</p>
                <p className="bg-white p-5">The way we communicate has changed.</p>
              </div>
              <p className="mt-8 max-w-4xl border-l-4 border-brand-secondary py-1 pl-6 text-2xl italic leading-9 text-brand-accent md:mt-10 md:pl-8 md:text-3xl md:leading-10">But our inner system has not changed at the same pace.</p>
            </div>
            <p className="max-w-4xl pt-5">
              So the brain often responds to modern situations using survival responses shaped for a caveman world.
            </p>
            <div className="my-12 grid gap-6 md:my-16 md:grid-cols-3 md:gap-8">
              <article className="border-t-2 border-brand-primary pt-6">
                <ShieldAlert className="h-6 w-6 text-brand-primary" aria-hidden="true" />
                <p className="mt-5">If a situation felt risky, avoiding it could increase your chances of survival. Today, that same response can show up as putting off difficult conversations, delaying important decisions, or procrastinating on work that feels emotionally uncomfortable.</p>
              </article>
              <article className="border-t-2 border-brand-secondary pt-6">
                <Users className="h-6 w-6 text-brand-accent" aria-hidden="true" />
                <p className="mt-5">If your place in the tribe determined whether you belonged, paying attention to where you stood made sense. Today, that same response can show up as comparing yourself to others, worrying about how you&apos;re perceived, or constantly wondering if you&apos;re falling behind.</p>
              </article>
              <article className="border-t-2 border-brand-teal pt-6">
                <Brain className="h-6 w-6 text-brand-teal" aria-hidden="true" />
                <p className="mt-5">If anticipating danger helped you prepare for what could go wrong, your brain learned to stay alert. Today, that same response can show up as overthinking, worrying, replaying conversations, and imagining problems long before they happen.</p>
              </article>
            </div>
            <p className="max-w-4xl">
              These responses made sense back then.
            </p>
            <p className="max-w-4xl">
              The challenge is that your brain is still using these survival responses in today&apos;s modern world that no longer demands them in the same way.
            </p>
            <p className="relative my-16 overflow-hidden bg-brand-dark px-6 py-12 font-serif text-[clamp(3rem,6vw,6.25rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-brand-secondary md:px-10 md:py-16">
              So…long story short
            </p>
            <p className="max-w-4xl font-serif text-2xl font-bold leading-9 text-brand-dark md:text-3xl md:leading-10">
              Your brain is around 200,000 years old. The world you are living in is not.
            </p>
            <p className="max-w-4xl text-brand-dark/80">
              That is where Neurocient Labs comes in with a different approach.
            </p>
            <p className="max-w-4xl font-bold text-brand-dark">
              Rooted in evolutionary psychology, Neurocient Labs helps you understand — why you do what you do, why modern approaches often fall short, and what needs to change at the source. Then it helps you apply those insights in everyday life, so change actually lasts.
            </p>
            <div className="mt-12 space-y-5 pt-9 text-brand-dark">
              <p>To make lasting change, the first step is awareness.</p>
              <p>Not just of your behaviours, but of what is driving them.</p>
              <p className="pt-2 font-serif text-2xl font-bold leading-9 md:text-4xl md:leading-tight">Let&apos;s take that first step...</p>
            </div>
          </div>
        </div>

      </section>
  );
}
