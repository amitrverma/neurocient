import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, ScanLine } from "lucide-react";

const diagnostics = [
  {
    number: "01",
    audience: "For me",
    title: "Inner Caveman Scan",
    measure: "12 lived moments",
    question: "Why do I keep responding this way?",
    text: "Choose what you would actually do in ordinary moments involving delay, comparison, uncertainty, conflict, and pressure. Your result connects those answers to the automatic responses that may be shaping them.",
    href: "/diagnostics/caveman-scan",
    cta: "Start the personal scan",
    icon: ScanLine,
  },
  {
    number: "02",
    audience: "For my team",
    title: "CIC Diagnostic",
    measure: "Workplace situations",
    question: "What may be shaping this team?",
    text: "Examine how rank, disagreement, uncertainty, immediate consequences, and familiar defaults may be influencing decisions, ownership, feedback, and follow-through.",
    href: "/diagnostics/cic",
    cta: "Start the workplace diagnostic",
    icon: BriefcaseBusiness,
  },
];

export default function DiagnosticsPage() {
  return (
    <main className="surface-page diagnostics-page">
      <section className="surface-hero diagnostics-hero">
        <div>
          <p className="surface-eyebrow">Recognise what happens first</p>
          <h1 className="surface-title">
            Begin with a situation,
            <span>not a label.</span>
          </h1>
          <p className="surface-lede">
            A diagnostic should help you see a response more clearly—not turn
            it into a personality type. Choose the path that matches what you
            are trying to understand.
          </p>
        </div>
        <aside className="diagnostics-principle">
          <span>One rule</span>
          <strong>Answer from recognition, not aspiration.</strong>
          <p>
            The useful choice is what tends to happen next in real life, even
            when another answer sounds wiser.
          </p>
        </aside>
      </section>

      <section className="surface-section diagnostics-choice">
        <header className="surface-section-heading">
          <p className="surface-eyebrow">Choose your context</p>
          <h2>Personal patterns and workplace patterns need different questions.</h2>
        </header>

        <div className="diagnostics-grid">
          {diagnostics.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="diagnostic-card">
                <div className="diagnostic-card-top">
                  <span>{item.number}</span>
                  <Icon aria-hidden="true" />
                </div>
                <p>{item.audience}</p>
                <h2>{item.title}</h2>
                <small>{item.measure}</small>
                <h3>{item.question}</h3>
                <span className="diagnostic-card-copy">{item.text}</span>
                <strong>
                  {item.cta} <ArrowRight aria-hidden="true" />
                </strong>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="surface-section surface-dark diagnostics-use">
        <header className="surface-section-heading">
          <p className="surface-eyebrow surface-eyebrow-light">How to use a result</p>
          <h2>As a starting point, not a verdict.</h2>
        </header>
        <ol>
          <li><span>01</span><strong>Recognise</strong><p>Connect the result to situations you have actually lived.</p></li>
          <li><span>02</span><strong>Understand</strong><p>Look for the immediate payoff and the later cost.</p></li>
          <li><span>03</span><strong>Continue</strong><p>Use the result to choose one relevant explanation or next practice.</p></li>
        </ol>
      </section>
    </main>
  );
}
