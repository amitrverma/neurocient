import type { ReactNode } from "react";

export const SectionLabel = ({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) => (
  <div
    className={`mb-7 flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] ${
      tone === "dark" ? "text-brand-secondary" : "text-brand-teal"
    }`}
  >
    <span>{children}</span>
    <span
      className={`h-px flex-1 ${
        tone === "dark" ? "bg-white/20" : "bg-brand-dark/15"
      }`}
    />
  </div>
);

export const Stat = ({ number, label }: { number: string; label: string }) => (
  <div className="border-t border-brand-secondary/45 pt-5">
    <p className="font-serif text-5xl font-bold text-brand-secondary">
      {number}
    </p>
    <p className="mt-2 font-sans text-sm leading-6 text-white/68">{label}</p>
  </div>
);

export const Divider = () => (
  <div className="mx-auto h-px w-[calc(100%-3rem)] max-w-6xl bg-brand-dark/15" />
);


