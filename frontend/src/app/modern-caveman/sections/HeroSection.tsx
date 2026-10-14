"use client";

const HeroSection = () => {
  return (
    <section className="mc-hero">
      <div className="mc-hero-copy">
        <p className="mc-eyebrow">The Modern Caveman · A four-week live programme</p>
        <h1>
          You know what to do.
          <span>So why aren’t you doing it?</span>
        </h1>

        <p className="mc-hero-lead">
          You’ve read the books. Built the routines. Made the lists. You{" "}
          <em>believe</em> in self-improvement — but taking action still feels
          harder than it should.
        </p>

        <p className="mc-hero-note">
          It’s not laziness. It’s not willpower. It’s your inner caveman — the
          ancient wiring behind modern procrastination.
        </p>

        <div className="mc-hero-actions">
          <a className="mc-button mc-button-primary" href="#programme">
            Explore the programme
          </a>
          <a className="mc-text-link" href="#pricing">
            View investment <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      <aside className="mc-hero-map" aria-label="Programme structure">
        <p>From insight to follow-through</p>
        <ol>
          <li><span>01</span><strong>Recognise</strong><small>the patterns that keep repeating</small></li>
          <li><span>02</span><strong>Reflect</strong><small>on what drives them</small></li>
          <li><span>03</span><strong>Rebuild</strong><small>around the way you actually work</small></li>
        </ol>
      </aside>
    </section>
  );
};

export default HeroSection;
