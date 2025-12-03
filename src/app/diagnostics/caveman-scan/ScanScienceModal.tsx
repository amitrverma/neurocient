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
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center px-4"
      >
        <motion.div
          key="modal"
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
          className="
            relative bg-white w-full max-w-2xl rounded-2xl shadow-xl 
            p-8 md:p-10 max-h-[82vh] overflow-y-auto
          "
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="
              absolute top-5 right-5 
              text-brand-dark/50 hover:text-brand-dark transition-colors
            "
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title */}
          <h3 className="text-[1.55rem] font-semibold tracking-tight text-brand-accent mb-3 leading-snug">
            {content.title}
          </h3>

          {/* Subtitle */}
          {content.subtitle && (
            <p className="text-brand-dark/70 text-[1.02rem] leading-relaxed mb-6">
              {content.subtitle}
            </p>
          )}

          {/* Body */}
          <div
            className="
              prose prose-brand 
              max-w-none 
              text-brand-dark
              leading-relaxed
              prose-p:my-3
              prose-strong:text-brand-dark 
              prose-blockquote:border-l-4 
              prose-blockquote:border-brand-accent
              prose-blockquote:pl-4 
              prose-blockquote:text-brand-dark
            "
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScanScienceModal;
