"use client";

import React, { useEffect } from "react";

// ===========================
// Component
// ===========================
const Pricing: React.FC = () => {
  useEffect(() => {
    // Load Razorpay script only once
    if (!document.getElementById("razorpay-embed-btn-js")) {
      const script = document.createElement("script");
      script.src = "https://cdn.razorpay.com/static/embed_btn/bundle.js";
      script.defer = true;
      script.id = "razorpay-embed-btn-js";
      document.body.appendChild(script);
    } else {
      const rzp = (
        window as Window & { __rzp__?: { init?: () => void } }
      ).__rzp__;
      if (rzp && rzp.init) rzp.init();
    }
  }, []);

  return (
    <section
      id="pricing"
      className="mc-section mc-pricing"
    >
      <div className="mc-pricing-inner">

        {/* ===========================
            Intro Section
        ============================ */}
        <div className="mc-section-heading">
          <span className="mc-kicker">The investment</span>
          <h2>
            What’s the Price of Staying Stuck?
          </h2>

          <p className="text-lg text-brand-dark/70 leading-relaxed">
            You’ve bought the books. Tried the planners. Followed the advice.
            <br />
            You’re not short on insight — you’re short on traction.
            <br /><br />
            The Modern Caveman isn’t another information dump.  
            It’s a system — built for your wiring, guided with care.
          </p>
        </div>

        {/* ===========================
            Pricing Box
        ============================ */}
        <div className="mc-price-box">

          {/* Price Details */}
          <div className="flex-1 space-y-3">
            <p className="mc-price-label">Your Investment</p>
            <h3>₹21,000</h3>

            <p className="text-brand-dark/70 leading-relaxed text-base max-w-md">
              Four weeks of structure, live sessions, nudges, tools,  
              and a science-backed framework you’ll use for life.
            </p>
          </div>

          {/* Razorpay Button */}
          <div className="shrink-0 flex items-center justify-center h-full">
            <div
              className="razorpay-embed-btn"
              data-url="https://pages.razorpay.com/pl_QcEgHiJaxzItMc/view"
              data-text="Pay Now"
              data-color="#5EB1BF"
              data-size="large"
            />
          </div>
        </div>

        {/* ===========================
            Emotional Close
        ============================ */}
        <div className="mc-pricing-close">

          <p>
            You’re not just buying a course.  
            You’re reclaiming traction — in your routines, your energy,  
            and your sense of control.
          </p>

          <p>
            You’re trading guilt and guesswork for a system that <em>finally</em> fits.  
            People like you — thoughtful, intentional, done with repeating the same patterns —  
            are already shifting.
          </p>

          <div className="bg-brand-primary/10 border-l-4 border-brand-primary p-5 rounded-lg">
            <p className="italic text-brand-dark leading-relaxed">
              Show up for the first session.
              <br />
              If it doesn’t land — if it doesn’t feel like this is what’s been missing —  
              email me within 48 hours.
              <br />
              <strong className="text-brand-accent">
                I’ll refund you fully, no questions asked.
              </strong>
            </p>
          </div>

          <p>
            Because I’d rather you walk away with clarity  
            than stay stuck in circles.
          </p>

          <p className="text-xl font-semibold text-brand-dark mt-6">
            Staying stuck has a price.
            <br />
            Momentum does too — but it’s one you can afford.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
