"use client";

const HeroSection = () => {
  return (
    <section className="text-center space-y-6">
      <h1 className="text-3xl md:text-5xl font-bold text-brand-dark leading-tight font-serif">
        You know what to do.
        <br />
        <span className="text-brand-primary">
          So why aren’t you doing it?
        </span>
      </h1>

      <p className="text-lg md:text-xl text-brand-dark/70 max-w-3xl mx-auto leading-relaxed font-serif">
        You’ve read the books. Built the routines. Made the lists.  
        You <span className="italic">believe</span> in self-improvement — but taking action still feels harder than it should.
      </p>

      <p className="text-lg text-brand-dark/70 max-w-2xl mx-auto leading-relaxed font-serif">
        It’s not laziness. It’s not willpower.  
        It’s your inner caveman — the ancient wiring behind modern procrastination.
      </p>
    </section>
  );
};

export default HeroSection;
