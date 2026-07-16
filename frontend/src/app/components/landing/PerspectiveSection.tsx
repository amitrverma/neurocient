import { SectionDecorations, SectionLabel } from "./LandingShared";

export default function PerspectiveSection() {
  return (
      <section className="relative overflow-hidden bg-white text-brand-dark">
        <SectionDecorations />
        <div className="pointer-events-none absolute left-1/2 top-[28rem] h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-brand-secondary/10 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 md:py-28">
          <SectionLabel>A Different Perspective on Getting More Life from Life</SectionLabel>
          <h2 className="max-w-5xl text-balance text-[clamp(3.25rem,7vw,7rem)] font-bold leading-[0.89] tracking-[-0.055em]">
            It is not your <span className="italic text-brand-accent">personal failing.</span>
          </h2>

          <p className="mt-12 max-w-5xl border-y border-brand-dark/15 py-8 font-serif text-2xl font-bold leading-9 text-brand-dark md:py-10 md:text-4xl md:leading-tight">
            You think you are flawed. But you are human.
          </p>

          <div className="mt-16 max-w-5xl md:mt-20">
            <p className="font-serif text-3xl font-bold leading-10 tracking-[-0.02em] md:text-5xl md:leading-tight">
              The gap between knowing and doing isn&apos;t simply about willpower, discipline, or motivation.
            </p>
            <div className="mt-9 overflow-hidden border-y border-brand-dark/15 font-sans">
              {[
                "To understand why,",
                "we need to go back around",
                "200,000 years",
              ].map((text, index) => (
                <div key={text} className="group flex items-center gap-5 border-b border-brand-dark/12 px-1 py-5 last:border-b-0 md:gap-8 md:py-6">
                  <span className="font-serif text-3xl font-bold italic text-brand-primary/35 transition-colors group-hover:text-brand-primary md:text-4xl">0{index + 1}</span>
                  <p className="text-lg font-semibold leading-8 text-brand-dark md:text-2xl md:leading-9">{text}</p>
                </div>
              ))}
            </div>

            <p className="my-12 max-w-4xl border-l-4 border-brand-primary py-2 pl-6 font-serif text-3xl font-bold italic leading-10 text-brand-accent md:my-16 md:text-5xl md:leading-tight">
              For most of human history, our ancestors lived in caves, in small groups where survival depended on avoiding danger, finding food, and staying connected to the tribe.
            </p>

            <div className="relative flex flex-col gap-7 overflow-hidden bg-[#f3eee6] px-6 py-9 font-sans text-base leading-8 text-brand-dark/80 before:absolute before:right-0 before:top-0 before:h-28 before:w-28 before:rounded-bl-full before:border-b before:border-l before:border-brand-dark/10 md:px-10 md:py-12 md:text-lg md:leading-9">
              <p className="max-w-4xl">
                In that world, every decision carried consequences. Mistaking a predator for the wind could cost you your life. Being excluded from the tribe could leave you without protection. Missing the chance to eat when food was available meant there was no guarantee of another meal tomorrow.
              </p>
              <p className="max-w-4xl border-t border-brand-dark/15 pt-7 font-serif text-2xl font-bold leading-9 text-brand-dark md:text-3xl md:leading-10">Over thousands of generations, the human brain adapted to those conditions. It became remarkably good at spotting danger, remembering negative experiences, seeking safety, and repeating behaviours that increased the chances of survival. The more often those responses helped people survive, the more automatic they became.</p>
            </div>

            <p className="mt-12 max-w-4xl border-l-4 border-brand-secondary pl-6 font-sans text-base leading-8 text-brand-dark/80 md:text-lg md:leading-9">
              The brain wasn&apos;t trying to make humans happy. It was trying to keep them alive.
            </p>
          </div>

          <div className="mt-20 max-w-5xl space-y-7 border-t border-brand-dark/20 pt-14 font-sans text-base leading-8 text-brand-dark/80 md:mt-28 md:pt-20 md:text-lg md:leading-9">
            <div className="font-serif font-bold text-brand-dark">
              <p className="max-w-5xl text-balance text-[clamp(2.9rem,6vw,6rem)] leading-[0.98] tracking-[-0.045em]">Today, the world around us has changed dramatically. Technology has changed. The way we work has changed. The way we communicate has changed.</p>
              <p className="mt-8 max-w-4xl border-l-4 border-brand-secondary py-1 pl-6 text-[clamp(2rem,3.8vw,3.75rem)] italic leading-[1.08] tracking-[-0.025em] text-brand-accent md:mt-10 md:pl-8">But our inner system has not changed at the same pace.</p>
            </div>
            <p className="max-w-4xl pt-5">
              So the brain often responds to modern situations using survival responses shaped for a caveman world.
            </p>
            <p className="max-w-4xl">
              If a situation felt risky, avoiding it could increase your chances of survival. Today, that same response can show up as putting off difficult conversations, delaying important decisions, or procrastinating on work that feels emotionally uncomfortable.
            </p>
            <div className="my-12 border-y border-brand-dark/15 py-10 font-serif text-4xl font-bold leading-tight text-brand-dark md:my-16 md:py-12 md:text-6xl">
              <p>If your place in the tribe determined whether you belonged, paying attention to where you stood made sense. Today, that same response can show up as comparing yourself to others, worrying about how you&apos;re perceived, or constantly wondering if you&apos;re falling behind.</p>
              <p className="italic text-brand-accent">If anticipating danger helped you prepare for what could go wrong, your brain learned to stay alert. Today, that same response can show up as overthinking, worrying, replaying conversations, and imagining problems long before they happen.</p>
            </div>
            <p className="max-w-4xl">
              These responses made sense back then.
            </p>
            <p className="max-w-4xl">
              The challenge is that your brain is still using these survival responses in today&apos;s modern world that no longer demands them in the same way.
            </p>
            <p className="relative my-16 overflow-hidden bg-brand-dark px-6 py-12 font-serif text-[clamp(3rem,6vw,6.25rem)] font-bold leading-[1.02] tracking-[-0.04em] text-white after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:bg-brand-secondary md:px-10 md:py-16">
              So…to cut the long story short
            </p>
            <p className="max-w-4xl font-serif text-2xl font-bold leading-9 text-brand-dark md:text-3xl md:leading-10">
              Your brain is around 200,000 years old. The world you are living in is not.
            </p>
            <p className="max-w-4xl font-serif text-2xl leading-9 text-brand-dark md:text-3xl md:leading-10">
              That is where Neurocient Labs comes in with a different approach.
            </p>
            <p className="max-w-4xl border-l-4 border-brand-secondary py-1 pl-6 font-bold text-brand-dark">
              Rooted in evolutionary psychology, Neurocient Labs helps you understand — why you do what you do, why modern approaches often fall short, and what needs to change at the source. Then it helps you apply those insights in everyday life, so change actually lasts.
            </p>
            <div className="mt-12 border-t border-brand-dark/15 pt-9 font-serif text-2xl font-bold leading-9 text-brand-dark md:text-4xl md:leading-tight">
              <p>To make lasting change, the first step is awareness.</p>
              <p>Not just of your behaviours, but of what is driving them.</p>
              <p>Let&apos;s take that first step...</p>
            </div>
          </div>
        </div>

      </section>
  );
}
