import Image from "next/image";
import { SectionDecorations, SectionHeading, SectionLabel } from "./LandingShared";

const struggles = [
  {
    title: "Waiting to Feel Ready",
    lead: "You have been putting off a lot of stuff because you don't feel ready.",
    detail:
      "Starting that project, reaching out to old friends, starting exercising , trying new things.",
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
      <section id="struggle" className="relative scroll-mt-24 overflow-hidden bg-white">
        <SectionDecorations flip />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-16 md:pb-28 md:pt-24">
        <SectionLabel>The modern challenge</SectionLabel>
        <div className="flex flex-col gap-7 md:gap-10">
          <SectionHeading>
            “Why do I do that<span className="text-brand-primary">?</span>”
          </SectionHeading>
          <div className="max-w-5xl py-7 font-sans text-base leading-7 text-brand-dark md:py-9 md:text-lg md:leading-8">
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
            <div className="mt-8 grid max-w-5xl gap-6 md:mt-10 md:grid-cols-3 md:gap-8">
              <p>Over time, it becomes frustrating. You stop asking why you can&apos;t seem to make things stick, and start wondering if something is wrong with you.</p>
              <p>You tell yourself next week will be different. After this project. After the holidays. Once work settles down. Once life feels less busy. But somehow, that version of your life never arrives.</p>
              <p>Instead, the same struggles keep showing up in different parts of your life. Some are obvious. Others become so familiar that they start to feel like part of who you are.</p>
              <p className="pt-7 font-serif text-2xl font-bold leading-8 text-brand-dark md:col-span-3 md:text-3xl md:leading-10">Here are a few patterns you might recognize</p>
            </div>
          </div>
        </div>
        <div className="mt-9 md:mt-11">
          <StruggleSequence />
          <div className="mt-10 max-w-4xl space-y-6 font-sans text-base leading-8 text-brand-dark md:text-lg md:leading-9">
            <p>These patterns may look different from person to person.</p>
            <p>But if you&apos;ve recognized yourself in even one of them, you&apos;ve probably already searched for answers and followed more advice than you can remember.</p>
            <p className="font-serif text-2xl font-bold leading-9 md:text-3xl md:leading-10">And to live a life which is more fulfilling...</p>
          </div>
        </div>
        </div>
      </section>
  );
}

const StruggleSequence = () => (
  <div className="relative mt-5">
    <div className="grid gap-5 md:grid-cols-2 md:gap-7">
      {struggles.map((item, index) => (
        <article
          key={item.title}
          className={`relative grid w-full overflow-hidden rounded-md border border-brand-dark/15 bg-white ${
            index === 0 || index === 3 || index === 6
              ? "md:col-span-2 md:min-h-[25rem] md:grid-cols-[0.76fr_1.24fr]"
              : "md:grid-rows-[14rem_1fr]"
          }`}
        >
          <div className={`relative flex min-h-52 items-center justify-center overflow-hidden border-b border-brand-dark/15 px-8 pb-4 pt-9 ${
            index === 0 || index === 3 || index === 6
              ? "md:min-h-full md:border-b-0 md:border-r md:p-8"
              : "md:min-h-0 md:p-6"
          }`}>
            <Image
              src={patternImages[index]}
              alt=""
              width={560}
              height={560}
              sizes="(max-width: 767px) 72vw, 30vw"
              className={`h-auto w-full mix-blend-multiply ${index === 0 || index === 3 || index === 6 ? "max-w-56 md:max-w-64" : "max-w-48"}`}
            />
          </div>

          <div className={`relative flex flex-col justify-center px-6 py-8 sm:px-9 ${index === 0 || index === 3 || index === 6 ? "md:px-12 md:py-10 lg:px-16" : "md:px-8 md:py-9"}`}>
            <span className="flex items-center gap-3 font-sans text-[0.65rem] font-bold uppercase tracking-[0.2em] text-brand-accent/70">
              <span className="h-px w-4 bg-brand-primary/60" />
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className={`mt-5 max-w-[18ch] font-bold leading-[1.04] tracking-[-0.035em] text-brand-dark text-balance ${index === 0 || index === 3 || index === 6 ? "text-[clamp(2rem,3.7vw,3.4rem)]" : "text-[clamp(1.8rem,2.7vw,2.6rem)]"}`}>
              {item.title}
            </h3>
            <p className="mt-6 max-w-[31ch] font-serif text-xl font-bold leading-[1.38] text-brand-dark sm:text-2xl md:text-[1.65rem]">
              {item.lead}
            </p>
            <div className="mt-6 max-w-[39rem] font-sans text-sm leading-7 text-brand-dark/70 md:text-[0.95rem] md:leading-8">
              <p>{item.detail}</p>
              <p className="mt-6 border-l-2 border-brand-secondary pl-5 font-serif text-lg italic leading-7 text-brand-dark md:text-xl md:leading-8">
                {item.close}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
);


