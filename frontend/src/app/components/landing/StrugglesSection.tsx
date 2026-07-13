import Image from "next/image";
import { SectionDecorations, SectionLabel } from "./LandingShared";

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

const patternImages = [
  "/images/landing/patterns/waiting-ready.png",
  "/images/landing/patterns/endless-scroll.png",
  "/images/landing/patterns/comparison.png",
  "/images/landing/patterns/pressure.png",
  "/images/landing/patterns/worries.png",
  "/images/landing/patterns/guilt.png",
  "/images/landing/patterns/unrested.png",
];

export default function StrugglesSection() {
  return (
      <section id="struggle" className="relative scroll-mt-24 overflow-hidden bg-[#f7f5f0]">
        <SectionDecorations flip />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
        <SectionLabel>The modern challenge</SectionLabel>
        <div className="flex flex-col gap-7 md:gap-10">
          <h2 className="max-w-5xl text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.05em] text-brand-dark">
            Why do I do that<span className="text-brand-primary">?</span>
          </h2>
          <div className="max-w-5xl border-y border-brand-dark/15 py-7 font-sans text-base leading-7 text-brand-dark md:py-9 md:text-lg md:leading-8">
            <p className="max-w-3xl">You know what needs to be done. You may even want to do it.</p>
            <ul className="mt-6 grid gap-5 sm:grid-cols-3 md:mt-8 md:gap-8">
              <li className="border-t-2 border-brand-primary pt-3">
                And yet, you don&apos;t.
              </li>
              <li className="border-t-2 border-brand-secondary pt-3">
                Not always. Not completely.
              </li>
              <li className="border-t-2 border-brand-teal pt-3">
                But often enough to wonder what&apos;s really going on.
              </li>
            </ul>
            <p className="mt-8 max-w-4xl font-serif text-2xl font-bold leading-8 text-brand-dark md:mt-10 md:text-3xl md:leading-10">
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
  <div className="relative mt-5">
    <div className="space-y-8 md:space-y-10">
      {struggles.map((item, index) => (
        <article
          key={item.title}
          className="relative grid w-full overflow-hidden rounded-md border border-[#ded8cc] bg-[#fffefa] shadow-[0_18px_45px_rgba(4,42,43,0.08)] md:min-h-[26rem] md:grid-cols-[0.76fr_1.24fr]"
        >
          <div className="relative flex min-h-52 items-center justify-center overflow-hidden border-b border-[#ded8cc] px-8 pb-4 pt-9 md:min-h-full md:border-b-0 md:border-r md:p-8">
            <Image
              src={patternImages[index]}
              alt=""
              width={560}
              height={560}
              sizes="(max-width: 767px) 72vw, 30vw"
              className="h-auto w-full max-w-56 mix-blend-multiply md:max-w-64"
            />
          </div>

          <div className="relative flex flex-col justify-center px-6 py-8 sm:px-10 md:px-12 md:py-10 lg:px-16">
            <span className="flex items-center gap-3 font-sans text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#b96e19]">
              <span className="h-px w-4 bg-[#b96e19]" />
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-5 max-w-[18ch] text-[clamp(2rem,3.7vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.035em] text-brand-dark text-balance">
              {item.title}
            </h3>
            <p className="mt-6 max-w-[31ch] font-serif text-xl font-bold leading-[1.38] text-brand-dark sm:text-2xl md:text-[1.65rem]">
              {item.lead}
            </p>
            <div className="mt-6 max-w-[39rem] font-sans text-sm leading-7 text-brand-dark/70 md:text-[0.95rem] md:leading-8">
              <p>{item.detail}</p>
              <p className="mt-6 border-l-2 border-[#c47a20] pl-5 font-serif text-lg italic leading-7 text-brand-dark md:text-xl md:leading-8">
                {item.close}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
);


