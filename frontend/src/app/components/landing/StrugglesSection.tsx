import { SectionLabel } from "./LandingShared";

const struggles = [
  {
    title: "Waiting to Feel Ready",
    lead: "You have been putting off a lot of stuff because you don't feel ready.",
    detail:
      "Starting that project, reaching out to old friends, starting exercising, trying new things.",
    close:
      "Always telling yourself you’ll do it when you are more prepared, more confident, more together. Waiting for some magical moment of confidence or clarity that never showed up",
  },
  {
    title: "Escaping Into the Scroll",
    lead: "You often catch yourself wasting hours scrolling on your phone, watching other people's lives.",
    detail:
      "The whole time, You know but you ignore a \"signal\" to do something better with your time.",
    close:
      "You want to improve, but the worry feels overwhelming, which makes you run back to your phone to distract yourself.",
  },
  {
    title: "Measuring Yourself Against Others",
    lead: "Comparison has been automatic in your life, almost like background noise you never questioned.",
    detail:
      "As a younger self it might show up in small ways, what other people wore, how confident they seemed, how easily things appeared to come to them. As an adult it shifted into career, progress, and timing, watching others hit milestones and wondering what you are doing wrong.",
    close:
      "What’s strange is that on paper your life is fine, stable even, but the habit of comparing never really cared about facts",
  },
  {
    title: "Pressure That Never Switches Off",
    lead: "There's always something unfinished, unresolved, or waiting for your attention.",
    detail:
      "Even when you're resting, your mind keeps making lists, or jumping ahead to the next thing.",
    close:
      "You keep scrolling to escape your stressful reality.",
  },
  {
    title: "Worries That Never Leave",
    lead: "You replay conversations and anticipate problems before they happen.",
    detail:
      "You are thinking/overthinking all the time. Pre-playing and re-playing social interactions in your head. And more often than not the things you imagine might go wrong never happen.",
    close:
      "No inner dialogue, just peace. You can’t even imagine what that’s like.",
  },
  {
    title: "The Guilt That Doesn't Go Away",
    lead: "You've hit a point where you're scared for yourself.",
    detail:
      "You've tried every self-help method under the sun — gym, healthy food, multivitamins, motivational quotes all over your room, goal planning, screen filters — but nothing sticks. You make detailed plans,",
    close:
      "print them, write them on your walls, and yet you waste whole days doing nothing meaningful. You keep procrastinating. Just watching random videos or scrolling aimlessly.",
  },
  {
    title: "Rest That Doesn't Restore",
    lead: "You sleep. You take breaks. You step away when you can.",
    detail:
      "But you wake up tired, struggle to recharge, and feel like your energy runs out before you get to what matters most. You've tried to learn restful hobbies (meditation, yoga, journaling) but with those things you are still pushing yourself to rest harder.",
    close:
      "You burnout easily and it effects your day to day life",
  },
];
export default function StrugglesSection() {
  return (
      <section
        id="struggle"
        className="relative mx-auto w-full max-w-6xl scroll-mt-24 overflow-hidden px-6 pb-20 pt-12 md:pb-28 md:pt-16"
      >
        <div className="relative z-10">
        <SectionLabel>The modern challenge</SectionLabel>
        <div className="grid gap-6 md:grid-cols-[1.1fr_.9fr] md:items-end md:gap-12">
          <h2 className="text-[clamp(3rem,5.2vw,5.5rem)] font-bold leading-[0.94] tracking-[-0.045em] text-brand-dark">
            Why do I do that<span className="text-brand-primary">?</span>
          </h2>
          <div className="max-w-2xl border-l-2 border-brand-teal/35 pl-5 font-sans text-base leading-7 text-brand-dark md:text-lg md:leading-8">
            <p>You know what needs to be done. You may even want to do it.</p>
            <ul className="my-4 space-y-2">
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                <span>And yet, you don&apos;t.</span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-secondary" />
                <span>Not always. Not completely.</span>
              </li>
              <li className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-teal" />
                <span>But often enough to wonder what&apos;s really going on.</span>
              </li>
            </ul>
            <p className="font-serif text-xl font-bold leading-7 text-brand-dark md:text-2xl md:leading-8">
              It shows up in different ways for different people. Here are seven you might recognize.
            </p>
          </div>
        </div>
        <div className="mt-9 md:mt-11">
          <StruggleSequence />
          <p className="mt-10 max-w-4xl border-l-4 border-brand-secondary pl-5 font-serif text-2xl leading-9 text-brand-dark md:text-3xl md:leading-10">
            These patterns may look different from person to person, but the response is usually the same.
          </p>
        </div>
        </div>
      </section>
  );
}

const StruggleSequence = () => (
  <div className="border-y border-brand-dark/15">
    {struggles.map((item) => (
      <article
        key={item.title}
        className="relative border-b border-brand-dark/12 py-9 last:border-b-0 md:grid md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.25fr)] md:gap-10 md:py-12 lg:gap-16"
      >
        <div>
          <h3 className="text-2xl font-bold leading-tight tracking-[-0.025em] text-brand-dark md:text-3xl">
            {item.title}
          </h3>
          <p className="mt-5 text-xl font-medium leading-7 text-brand-dark md:text-2xl md:leading-8">
            {item.lead}
          </p>
        </div>

        <div className="mt-6 space-y-5 font-sans text-sm leading-7 text-brand-dark/75 md:mt-0 md:text-base md:leading-8">
          <p>{item.detail}</p>
          <p className="border-l-4 border-brand-secondary pl-4 font-serif text-lg leading-7 text-brand-dark md:pl-5 md:text-xl md:leading-8">
            {item.close}
          </p>
        </div>
      </article>
    ))}
  </div>
);


