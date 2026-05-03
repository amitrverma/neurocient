"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ScanScienceBlock } from "./questionsBank";

interface Props {
  open: boolean;
  content: ScanScienceBlock | null;
  onClose: () => void;
}

const ScanScienceModal = ({ open, content, onClose }: Props) => {
  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!open || !content) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/62 px-4 backdrop-blur-sm"
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[84vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-brand-dark/10 bg-white shadow-[0_28px_90px_rgba(4,42,43,0.28)]"
        >
          <div className="border-b border-brand-dark/10 px-6 py-5 md:px-8 md:py-6">
            <div className="mb-4 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
              <span>Science note</span>
              <span className="h-px flex-1 bg-brand-dark/15" />
              <button
                onClick={onClose}
                aria-label="Close science note"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-brand-dark/15 text-brand-dark transition hover:border-brand-primary hover:text-brand-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h3 className="font-serif text-2xl font-bold leading-tight tracking-[-0.015em] text-brand-dark md:text-4xl">
              {content.title}
            </h3>

            {content.subtitle && (
              <p className="mt-3 max-w-2xl border-l-4 border-brand-secondary pl-4 font-sans text-sm leading-7 text-brand-dark/76 md:text-base md:leading-8">
                {content.subtitle}
              </p>
            )}
          </div>

          <div
            className="overflow-y-auto px-6 py-6 md:px-8 md:py-7"
          >
            <div
              className="prose max-w-none font-sans text-sm leading-7 text-brand-dark prose-p:my-4 prose-h5:mb-2 prose-h5:mt-6 prose-h5:font-sans prose-h5:text-xs prose-h5:font-semibold prose-h5:uppercase prose-h5:tracking-[0.14em] prose-h5:text-brand-primary prose-strong:text-brand-accent prose-blockquote:my-5 prose-blockquote:border-l-4 prose-blockquote:border-brand-secondary prose-blockquote:bg-white prose-blockquote:py-1 prose-blockquote:pl-5 prose-blockquote:font-serif prose-blockquote:text-lg prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:leading-8 prose-blockquote:text-brand-dark md:text-[0.95rem] md:leading-8"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScanScienceModal;
