"use client";

import { ArrowRight } from "lucide-react";

interface Props {
  onStart: () => void;
}

const CavemanScanIntro = ({ onStart }: Props) => {
  return (
    <main className="surface-page">
      <section className="surface-hero journey-intro">
        <div>
          <p className="surface-eyebrow">The Inner Caveman Scan</p>
          <h1 className="surface-title">
            See what happens
            <span>before intention catches up.</span>
          </h1>
          <p className="surface-lede">
            Answer from familiar situations, not from the person you think you
            should be. The result connects your choices to automatic responses
            and the conditions that make them easier to repeat.
          </p>
          <button onClick={onStart} className="surface-action">
            Begin with the first situation
            <ArrowRight aria-hidden="true" />
          </button>
        </div>

        <aside className="journey-example" aria-label="An example scan situation">
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
