import { SectionLabel } from "./LandingShared";

const struggles = [
  {
    title: "Escaping Into the Scroll",
    eyebrow: "One more check",
    lead: "The work is right there.",
    detail:
      "You tell yourself you'll start in a minute: just one check, one tab, one video. Something small, something harmless. And then another. Time passes without resistance. It doesn't feel like a choice. It feels like something you slipped into. When you look up, the task is still there.",
    close:
      "Only now, it feels heavier than before.",
  },
  {
    title: "Pressure That Never Switches Off",
    eyebrow: "Always in the background",
    lead: "There's always something in the background.",
    detail:
      "Something unfinished. Something pending. Something you should get to next. Even in the quieter moments, it doesn't fully leave. It stays: subtle, but present. You move from one thing to another, carrying it along.",
    close:
      "Not urgent enough to act on. Not distant enough to ignore.",
  },
  {
    title: "Worries That Never Leave",
    eyebrow: "The mind keeps rehearsing",
    lead: "You replay conversations and anticipate problems before they happen.",
    detail:
      "You are thinking/overthinking all the time. Pre-playing and re-playing social interactions in your head. And more often than not the things you imagine might go wrong never happen.",
    close:
      "No inner dialogue, just peace. You can’t even imagine what that’s like.",
  },
  {
    title: "The Guilt That Doesn't Go Away",
    eyebrow: "Another plan abandoned",
    lead: "You've hit a point where you're scared for yourself.",
    detail:
      "You've tried every self-help method under the sun — gym, healthy food, multivitamins, motivational quotes all over your room, goal planning, screen filters — but nothing sticks. You make detailed plans,",
    close:
      "print them, write them on your walls, and yet you waste whole days doing nothing meaningful. You keep procrastinating.  Just watching random videos or scrolling aimlessly.",
  },
  {
    title: "Measuring Yourself Against Others",
    eyebrow: "Status scanning",
    lead: "You're doing your thing, and then something shifts.",
    detail:
      "Someone else is ahead. Moving faster. Doing it better. At least, it looks that way. You weren't thinking about it a moment ago. Now you are. Your pace feels slower. Your progress feels smaller. What you have doesn't land the same anymore. Nothing has changed.",
    close:
      "But it feels like you've fallen behind.",
  },
  {
    title: "Rest That Doesn't Restore",
    eyebrow: "Recovery that doesn't land",
    lead: "You sleep. You take breaks. You step away when you can.",
    detail:
      "But it doesn't quite land. The day starts a little lower than it should. Simple things take more effort. By the time you get to what matters, there isn't much left.",
    close:
      "It's not that you're doing nothing. It just never feels like you've recovered.",
  },
  {
    title: "Waiting to Feel Ready",
    eyebrow: "The moving start line",
    lead: "You know what needs to be done.",
    detail:
      "It isn't unclear. You've thought about it enough times already. But you wait. For the right mood. The right clarity. The sense that now is the moment to begin. The start keeps moving.",
    close:
      "And with it, everything that depends on it.",
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
                <span>But often enough to notice a pattern.</span>
              </li>
            </ul>
            <p className="font-serif text-xl font-bold leading-7 text-brand-dark md:text-2xl md:leading-8">
              That&apos;s the part worth paying attention to.
            </p>
          </div>
        </div>
        <div className="mt-9 md:mt-11">
          <StruggleSequence />
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
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-brand-primary">
            {item.eyebrow}
          </p>
          <h3 className="mt-2 text-2xl font-bold leading-tight tracking-[-0.025em] text-brand-dark md:text-3xl">
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


