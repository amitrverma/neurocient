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

export const Divider = () => (
  <div className="mx-auto h-px w-[calc(100%-3rem)] max-w-6xl bg-brand-dark/15" />
);

export const SectionHeading = ({
  children,
  tone = "light",
  className = "",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) => (
  <h2
    className={`max-w-5xl text-balance text-[clamp(2.75rem,6.5vw,6rem)] font-bold leading-[0.96] tracking-[-0.045em] ${
      tone === "dark" ? "text-white" : "text-brand-dark"
    } ${className}`}
  >
    {children}
  </h2>
);

export const SectionDecorations = ({
  tone = "light",
  flip = false,
}: {
  tone?: "light" | "dark";
  flip?: boolean;
}) => {
  const line = tone === "dark" ? "bg-white/12" : "bg-brand-dark/12";
  const pulse = tone === "dark" ? "bg-brand-secondary" : "bg-brand-primary";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className={`absolute top-24 hidden w-44 items-center md:flex ${flip ? "left-0" : "right-0 flex-row-reverse"}`}>
        <span className={`h-px flex-1 ${line}`} />
        <span className={`h-2.5 w-2.5 rounded-full ${pulse}`} />
        <span className={`h-px w-8 ${line}`} />
      </div>
      <div className={`absolute bottom-[12%] hidden items-center md:flex ${flip ? "right-[3%]" : "left-[3%]"}`}>
        <span className={`h-px w-10 ${line}`} />
        <span className={`h-1.5 w-1.5 rounded-full ${pulse} opacity-60`} />
        <span className={`h-px w-20 ${line}`} />
      </div>
    </div>
  );
};

