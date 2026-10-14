import Link from "next/link";
import { ArrowRight, Instagram, Linkedin, Youtube } from "lucide-react";

const principles = [
  { number: "01", title: "Start with what happened", text: "Concrete situations reveal more than abstract labels about motivation, discipline, or personality." },
  { number: "02", title: "Explain the immediate payoff", text: "A response can make sense in the short term while producing a cost the person experiences later." },
  { number: "03", title: "Change the conditions", text: "Identity, knowledge, environment, and action all influence whether a different response becomes easier to repeat." },
];

const doorways = [
  { label: "Recognise", title: "Take the Inner Caveman Scan", text: "See automatic responses in familiar situations.", href: "/diagnostics/caveman-scan" },
  { label: "Understand", title: "Explore Insights", text: "Begin with a behavior you cannot quite explain.", href: "/insights" },
  { label: "Work with it", title: "Open Practice", text: "Work through one recurring behavior step by step.", href: "/practice" },
];

export default function AboutPage() {
  return (
    <main className="surface-page about-page">
      <section className="surface-hero about-hero">
        <div>
          <p className="surface-eyebrow">About Neurocient</p>
          <h1 className="surface-title">
            Modern problems.
            <span>Older responses.</span>
          </h1>
          <p className="surface-lede">
            Neurocient helps people recognise the automatic responses shaping
            everyday behavior, understand why they arise, and change the
            conditions that keep them easy to repeat.
          </p>
        </div>
        <aside className="about-promise">
          <span>The product promise</span>
          <strong>Get more life from life.</strong>
          <p>Reclaim time, energy, connection, and possibility from behavior that keeps repeating automatically.</p>
        </aside>
      </section>

      <section className="surface-section about-story">
        <header className="surface-section-heading">
          <p className="surface-eyebrow">Why this work exists</p>
          <h2>From complex technical systems to human ones.</h2>
        </header>
        <div className="about-story-copy">
          <p>For more than two decades, founder Amit Verma built software, led technology teams, and worked on systems designed to make life easier.</p>
          <p>Across work, health, focus, and relationships, the same contradiction kept appearing: people could understand the sensible action and still repeat something else.</p>
          <p>That question led into cognitive psychology, neuroscience, evolutionary biology, and behavior design—not to create another personality theory, but to explain the gap between knowing and doing more usefully.</p>
          <blockquote>Neurocient begins where advice often stops: with why another response keeps winning in the actual situation.</blockquote>
          <div className="about-credentials"><span>Engineering · NIT Warangal</span><span>MBA · IIM Calcutta</span><span>20+ years in technology leadership</span></div>
        </div>
      </section>

      <section className="surface-section surface-dark about-method">
        <header className="surface-section-heading">
          <p className="surface-eyebrow surface-eyebrow-light">The method</p>
          <h2>No invented inner character. No blame. No motivational theatre.</h2>
        </header>
        <div className="about-principles">
          {principles.map((principle) => (
            <article key={principle.number}><span>{principle.number}</span><h3>{principle.title}</h3><p>{principle.text}</p></article>
          ))}
        </div>
      </section>

      <section className="surface-section about-start">
        <header className="surface-section-heading">
          <p className="surface-eyebrow">Choose your doorway</p>
          <h2>One idea, carried into different kinds of work.</h2>
        </header>
        <div className="about-doorways">
          {doorways.map((item) => (
            <Link key={item.href} href={item.href}><small>{item.label}</small><h3>{item.title}</h3><p>{item.text}</p><ArrowRight aria-hidden="true" /></Link>
          ))}
        </div>
      </section>

      <section className="about-connect">
        <div><p className="surface-eyebrow surface-eyebrow-light">Follow the work</p><h2>Stay close to the questions.</h2></div>
        <div className="about-socials">
          <a href="https://www.linkedin.com/in/amitrverma/" target="_blank" rel="noopener noreferrer"><Linkedin aria-hidden="true" />LinkedIn</a>
          <a href="https://www.youtube.com/@neurocient" target="_blank" rel="noopener noreferrer"><Youtube aria-hidden="true" />YouTube</a>
          <a href="https://www.instagram.com/neurocient/" target="_blank" rel="noopener noreferrer"><Instagram aria-hidden="true" />Instagram</a>
        </div>
      </section>
    </main>
  );
}
