"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Microscope, X } from "lucide-react";
import type { ScanScienceBlock } from "./questionsBank";

interface Props {
  open: boolean;
  reflection: string;
  science: ScanScienceBlock | null;
  onClose: () => void;
  onContinue: () => void;
}

const CavemanScanFeedback = ({
  open,
  reflection,
  science,
  onClose,
  onContinue,
}: Props) => {
  const [showScience, setShowScience] = useState(false);

  useEffect(() => {
    if (!open) setShowScience(false);
  }, [open]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close explanation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 cursor-default bg-brand-dark/25 backdrop-blur-[2px]"
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={showScience ? "Science note" : "What is driving this?"}
            initial={{ opacity: 0, x: 28, y: 48, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, y: 48, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88svh] flex-col overflow-hidden rounded-t-[1.5rem] border border-brand-dark/10 bg-[#fffefa] text-brand-dark shadow-[0_28px_90px_rgba(4,42,43,0.28)] md:bottom-6 md:left-auto md:right-6 md:w-[min(34rem,calc(100vw-3rem))] md:rounded-[1.5rem]"
          >
            <header className="flex items-center justify-between gap-4 border-b border-brand-dark/10 px-5 py-4 sm:px-6">
              <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-brand-primary">
                {showScience ? "Science note" : "What is driving this?"}
              </p>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close explanation"
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-brand-dark/15 text-brand-dark/60 transition hover:border-brand-primary hover:text-brand-primary"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </header>

            <div className="overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              {showScience && science ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowScience(false)}
                    className="mb-5 inline-flex cursor-pointer items-center gap-2 font-sans text-sm font-semibold text-brand-dark/60 transition hover:text-brand-primary"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back to reflection
                  </button>
                  <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] sm:text-3xl">
                    {science.title}
                  </h2>
                  {science.subtitle ? (
                    <p className="mt-3 border-l-2 border-brand-secondary pl-4 font-sans text-sm leading-7 text-brand-dark/70">
                      {science.subtitle}
                    </p>
                  ) : null}
                  <div
                    className="prose mt-5 max-w-none font-sans text-sm leading-7 text-brand-dark prose-p:my-3 prose-h5:mb-1 prose-h5:mt-5 prose-h5:font-sans prose-h5:text-xs prose-h5:font-semibold prose-h5:uppercase prose-h5:tracking-[0.14em] prose-h5:text-brand-primary prose-blockquote:my-5 prose-blockquote:border-l-2 prose-blockquote:border-brand-secondary prose-blockquote:pl-4 prose-blockquote:font-serif prose-blockquote:text-lg prose-blockquote:not-italic prose-blockquote:text-brand-accent"
                    dangerouslySetInnerHTML={{ __html: science.body }}
                  />
                </div>
              ) : (
                <div
                  className="space-y-3 border-l-2 border-brand-secondary pl-4 font-sans text-sm leading-7 text-brand-dark sm:pl-5 sm:text-[0.95rem] sm:leading-8 [&_blockquote]:my-5 [&_blockquote]:font-serif [&_blockquote]:text-lg [&_blockquote]:font-bold [&_blockquote]:leading-8 [&_blockquote]:text-brand-accent [&_em]:italic [&_p]:my-3 [&_strong]:text-brand-accent"
                  dangerouslySetInnerHTML={{ __html: reflection }}
                />
              )}
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-brand-dark/10 bg-white/70 px-5 py-4 sm:px-6">
              {science && !showScience ? (
                <button
                  type="button"
                  onClick={() => setShowScience(true)}
                  className="inline-flex cursor-pointer items-center gap-2 font-sans text-sm font-semibold text-brand-dark transition hover:text-brand-primary"
                >
                  <Microscope className="h-4 w-4" aria-hidden="true" />
                  Want the science?
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:opacity-90"
              >
                Continue
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </footer>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};

export default CavemanScanFeedback;
