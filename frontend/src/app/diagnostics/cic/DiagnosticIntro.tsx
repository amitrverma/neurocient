"use client";

import { ArrowRight } from "lucide-react";

interface Props {
  onStart: () => void;
}

const DiagnosticIntro = ({ onStart }: Props) => {
  return (
    <main className="surface-page">
      <section className="surface-hero journey-intro">
        <div>
          <p className="surface-eyebrow">Workplace diagnostic</p>
          <h1 className="surface-title">
            See what the team does
            <span>when the stakes rise.</span>
          </h1>
          <p className="surface-lede">
            Work through 11 observable workplace situations: ownership that
            stays implied, dissent that becomes silence, recovery that keeps
            being postponed, and activity that replaces progress.
          </p>
          <button onClick={onStart} className="surface-action">
            Begin with the first team situation
            <ArrowRight aria-hidden="true" />
          </button>
        </div>

        <aside className="journey-summary">
          <span>What the result can show</span>
          <h2>A pattern in conditions and responses—not a team personality.</h2>
          <ol>
            <li><span>01</span><div><strong>Observe</strong><p>Choose what the team tends to do in a concrete situation.</p></div></li>
            <li><span>02</span><div><strong>Explain</strong><p>See the immediate consequence that can keep the response useful.</p></div></li>
            <li><span>03</span><div><strong>Redesign</strong><p>Change the meeting, decision, ownership, or recovery condition around it.</p></div></li>
          </ol>
        </aside>
      </section>
    </main>
  );
};

export default DiagnosticIntro;
