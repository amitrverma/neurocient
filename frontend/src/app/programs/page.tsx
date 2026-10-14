import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, UserRound } from "lucide-react";

const offers = [
  {
    number: "01",
    audience: "Personal programme",
    title: "The Modern Caveman",
    question: "Can I do this with live guidance?",
    text: "A four-week guided programme for closing the gap between what you understand and what you repeatedly do.",
    details: ["Two live sessions", "Four-week structure", "Personal IKEA loop", "Ongoing nudges and support"],
    href: "/modern-caveman",
    cta: "Explore the personal programme",
    icon: UserRound,
  },
  {
    number: "02",
    audience: "Workplace programme",
    title: "Caveman in the Cubicle",
    question: "How does this affect teams and leadership?",
    text: "A workplace lens and facilitated conversation for the automatic social responses shaping decisions, feedback, ownership, and execution.",
    details: ["CIC diagnostic", "Leadership lens", "Team behavior patterns", "Workshop conversation"],
    href: "/caveman-cubicle",
    cta: "Explore the workplace programme",
    icon: BriefcaseBusiness,
  },
];

export default function ProgramsPage() {
  return (
    <main className="surface-page programs-page">
      <section className="surface-hero programs-hero">
        <div>
          <p className="surface-eyebrow">Go deeper</p>
          <h1 className="surface-title">
            Guidance for a person.
            <span>Facilitation for a team.</span>
          </h1>
          <p className="surface-lede">
            Neurocient’s programmes add live guidance and shared structure when
            self-directed understanding or Practice is not enough.
          </p>
        </div>
        <aside className="programs-boundary">
          <p>Looking for self-guided work?</p>
          <strong>Practice is where you work through one recurring behavior yourself.</strong>
          <Link href="/practice">Open Practice <ArrowRight aria-hidden="true" /></Link>
        </aside>
      </section>

      <section className="surface-section programs-offers">
        <header className="surface-section-heading">
          <p className="surface-eyebrow">Choose the kind of support</p>
          <h2>Two audiences. Two different decisions.</h2>
        </header>
        <div className="programs-grid">
          {offers.map((offer) => {
            const Icon = offer.icon;
            return (
              <article key={offer.href} className="program-card">
                <div className="program-card-top"><span>{offer.number}</span><Icon aria-hidden="true" /></div>
                <p>{offer.audience}</p>
                <h2>{offer.title}</h2>
                <h3>{offer.question}</h3>
                <span className="program-card-copy">{offer.text}</span>
                <ul>{offer.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                <Link href={offer.href}>{offer.cta} <ArrowRight aria-hidden="true" /></Link>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
