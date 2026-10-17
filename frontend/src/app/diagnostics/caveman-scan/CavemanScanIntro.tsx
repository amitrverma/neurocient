"use client";

import { ArrowRight } from "lucide-react";

interface Props {
  hasProgress: boolean;
  onStart: () => void;
}

const CavemanScanIntro = ({ hasProgress, onStart }: Props) => {
  return (
    <main className="surface-page">
      <section className="surface-hero journey-intro">
        <div className="min-w-0 w-full">
          <p className="surface-eyebrow">About five minutes · 12 familiar situations</p>
          <h1 className="surface-title">
            See what happens
            <span>before intention catches up.</span>
          </h1>
          <p className="surface-lede">
            Choose what you would most likely do next in a series of ordinary
            situations. There are no right answers and nothing to diagnose.
            Each choice reveals how automatic processing can shape what happens
            before deliberate reasoning catches up.
          </p>
          <p className="mt-5 max-w-2xl font-sans text-base leading-7 text-brand-dark/65">
            At the end, you will see what your answers suggest and how Neurocient
            can help you work with these responses in real life.
          </p>
          <button onClick={onStart} className="surface-action">
            {hasProgress ? "Resume the Scan" : "Begin the Scan"}
            <ArrowRight aria-hidden="true" />
          </button>
        </div>

        <aside className="journey-example min-w-0 w-full" aria-label="An example scan situation">
          <span>One ordinary moment</span>
          <h2>You open the laptop to start. A minute later, the phone is in your hand.</h2>
          <div className="journey-reading">
            <small>01</small>
            <div><strong>The usual take</strong><p>You need more discipline. Put the phone away.</p></div>
          </div>
          <div className="journey-reading">
            <small>02</small>
            <div><strong>The useful question</strong><p>What made the phone closer, faster, or more certain than beginning the work?</p></div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default CavemanScanIntro;
