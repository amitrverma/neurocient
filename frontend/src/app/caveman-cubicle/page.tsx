import Link from "next/link";
import {
  ArrowRight,
  Brain,
  BriefcaseBusiness,
  Compass,
  Mail,
  Phone,
  Users,
} from "lucide-react";

const workplaceSignals = [
  {
    number: "01",
    situation: "People agree in the room, then drift afterward.",
    pattern: "Belonging pressure",
    explanation:
      "Open disagreement can carry a social cost, so apparent alignment may arrive before genuine commitment.",
  },
  {
    number: "02",
    situation: "Ownership is requested, but permission is still expected.",
    pattern: "Hierarchy sensitivity",
    explanation:
      "People continue reading rank and consequence even when leaders say they want independent action.",
  },
  {
    number: "03",
    situation: "Feedback gets softened until nothing changes.",
    pattern: "Status management",
    explanation:
      "The immediate benefit of avoiding friction can outweigh the later benefit of saying what the work requires.",
  },
  {
    number: "04",
    situation: "Capable teams become cautious under pressure.",
    pattern: "Familiar defaults",
    explanation:
      "Urgency narrows the options people consider and makes established responses easier to repeat.",
  },
];

const programAreas = [
  {
    title: "Decision-making pitfalls",
    label: "See the distortion",
    text: "Examine how optimism, sunk costs, loss aversion, and urgency alter execution in capable teams.",
    icon: Brain,
  },
  {
    title: "Leadership under the lens",
    label: "Read the signals",
    text: "Notice how tone, timing, rank, and ambiguity can produce silence or initiative before anyone names the cause.",
    icon: Users,
  },
  {
    title: "Behavior design",
    label: "Change the conditions",
    text: "Design practical cues and working conditions that make ownership, candor, and useful disagreement easier to repeat.",
    icon: Compass,
  },
];

const takeaways = [
  "A sharper read on why teams hesitate, conform, defer, or disengage.",
  "Bias-aware reflexes for decisions, feedback, meetings, and execution.",
  "Practical behavior-design moves that increase initiative and useful candor.",
  "A shared language for discussing human dynamics without blame.",
];

export default function CavemanInTheCubiclePage() {
  return (
    <main className="cubicle-page">
      <section className="cubicle-hero">
        <div className="cubicle-hero-copy">
          <p className="cubicle-eyebrow">A workplace programme by Neurocient</p>
          <h1>
            Caveman in
            <span>the Cubicle.</span>
          </h1>
          <p className="cubicle-hero-lede">
            The modern workplace runs on ancient social instincts. See what
            happens to ownership, candor, and decisions when status, belonging,
            and immediate consequences enter the room.
          </p>
          <div className="cubicle-actions">
            <Link className="cubicle-button cubicle-button-primary" href="/diagnostics/cic">
              Take the workplace diagnostic
              <ArrowRight aria-hidden="true" />
            </Link>
            <a className="cubicle-button cubicle-button-secondary" href="mailto:hello@neurocient.com">
              Discuss a workshop
            </a>
          </div>
        </div>

        <aside className="cubicle-brief" aria-label="The workplace gap">
          <div className="cubicle-brief-header">
            <BriefcaseBusiness aria-hidden="true" />
            <span>The workplace gap</span>
          </div>
          <p>Leaders ask for</p>
          <strong>Ownership · Candor · Initiative</strong>
          <div className="cubicle-brief-divider" aria-hidden="true">
            <span />
            <small>but often get</small>
            <span />
          </div>
          <strong>Deference · Silence · Familiar decisions</strong>
          <p>
            The gap is not explained by skill or intent alone. Automatic social
            responses also shape what people do next.
          </p>
        </aside>
      </section>

      <section className="cubicle-section cubicle-signals">
        <header className="cubicle-section-heading">
          <p className="cubicle-eyebrow">Recognise it at work</p>
          <h2>What looks like a people problem may be a pattern problem.</h2>
          <p>
            Start with what can be observed. Then examine the immediate social
            payoff that can keep the behavior going.
          </p>
        </header>

        <div className="cubicle-signal-list">
          {workplaceSignals.map((signal) => (
            <article key={signal.number} className="cubicle-signal">
              <span className="cubicle-signal-number">{signal.number}</span>
              <h3>{signal.situation}</h3>
              <div>
                <p>{signal.pattern}</p>
                <span>{signal.explanation}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cubicle-section cubicle-reframe">
        <div className="cubicle-reframe-title">
          <p className="cubicle-eyebrow cubicle-eyebrow-light">A better leadership lens</p>
          <h2>
            Do not ask only,
            <span>“What should they do?”</span>
          </h2>
        </div>
        <div className="cubicle-reframe-copy">
          <p>
            Ask what the situation makes easy now. A meeting can reward quick
            agreement. A review can make silence cheaper than honesty. An urgent
            decision can make the familiar option feel more defensible.
          </p>
          <p>
            Caveman in the Cubicle helps leaders recognise those conditions,
            understand the automatic responses they invite, and redesign the
            work around the behavior the organisation actually needs.
          </p>
          <blockquote>
            The aim is not to label people. It is to make the forces shaping
            behavior visible enough to change.
          </blockquote>
        </div>
      </section>

      <section className="cubicle-section cubicle-offer">
        <header className="cubicle-section-heading">
          <p className="cubicle-eyebrow">How the work begins</p>
          <h2>Read the room. Then redesign what happens in it.</h2>
        </header>

        <div className="cubicle-paths">
          <Link href="/diagnostics/cic" className="cubicle-diagnostic">
            <span className="cubicle-path-index">01 · Diagnose</span>
            <BriefcaseBusiness aria-hidden="true" />
            <h3>Find the instincts shaping execution.</h3>
            <p>
              Use the CIC diagnostic to examine where hierarchy sensitivity,
              conflict avoidance, status, and alignment breakdowns may be
              influencing the team.
            </p>
            <strong>
              Start CIC diagnostic <ArrowRight aria-hidden="true" />
            </strong>
          </Link>

          <div className="cubicle-workshop">
            <span className="cubicle-path-index">02 · Work together</span>
            <h3>Bring the lens into a leadership workshop.</h3>
            <p>
              Move from abstract leadership advice to the specific decisions,
              meetings, feedback loops, and working conditions your team needs
              to examine.
            </p>
            <a href="mailto:hello@neurocient.com">
              Discuss your team <ArrowRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className="cubicle-section cubicle-focus">
        <header className="cubicle-section-heading">
          <p className="cubicle-eyebrow">Programme focus</p>
          <h2>Three ways to see work differently.</h2>
        </header>
        <div className="cubicle-focus-grid">
          {programAreas.map((area, index) => {
            const Icon = area.icon;

            return (
              <article key={area.title}>
                <div>
                  <span>0{index + 1}</span>
                  <Icon aria-hidden="true" />
                </div>
                <p>{area.label}</p>
                <h3>{area.title}</h3>
                <span>{area.text}</span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="cubicle-section cubicle-outcomes">
        <div className="cubicle-outcomes-heading">
          <p className="cubicle-eyebrow">What leaders take back</p>
          <h2>A shared lens that survives the workshop.</h2>
        </div>
        <ol>
          {takeaways.map((takeaway, index) => (
            <li key={takeaway}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p>{takeaway}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="cubicle-contact">
        <div>
          <p className="cubicle-eyebrow cubicle-eyebrow-light">Bring it to work</p>
          <h2>Start with the pattern your team keeps repeating.</h2>
          <p>
            Use the diagnostic as a starting point, or tell us what you are
            seeing and explore a leadership workshop.
          </p>
        </div>
        <div className="cubicle-contact-actions">
          <a href="mailto:hello@neurocient.com">
            <Mail aria-hidden="true" />
            hello@neurocient.com
          </a>
          <a href="tel:+918551915656">
            <Phone aria-hidden="true" />
            +91-85519 15656
          </a>
        </div>
      </section>
    </main>
  );
}
