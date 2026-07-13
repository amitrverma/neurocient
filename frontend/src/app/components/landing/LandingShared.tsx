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

export const SectionDecorations = ({
  tone = "light",
  flip = false,
}: {
  tone?: "light" | "dark";
  flip?: boolean;
}) => {
  const line = tone === "dark" ? "border-white/10" : "border-brand-teal/15";
  const dots = tone === "dark" ? "rgba(255,255,255,0.18)" : "rgba(4,42,43,0.16)";
  const quietLine = tone === "dark" ? "bg-white/10" : "bg-brand-dark/10";
  const quietBorder = tone === "dark" ? "border-white/10" : "border-brand-dark/10";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className={`absolute ${flip ? "-left-28 top-16" : "-right-28 top-16"} h-64 w-64 rounded-full border ${line} md:h-80 md:w-80`} />
      <div className={`absolute ${flip ? "right-[7%] top-[12%]" : "left-[7%] top-[12%]"} h-9 w-9 rotate-12 border border-brand-secondary/25 md:h-12 md:w-12`} />
      <div className={`absolute ${flip ? "right-[10%]" : "left-[10%]"} top-[14%] h-px w-24 bg-gradient-to-r from-brand-secondary/25 to-transparent md:w-36`} />
      <div
        className={`absolute bottom-[8%] ${flip ? "left-[5%]" : "right-[5%]"} h-20 w-28 opacity-30 md:h-24 md:w-36`}
        style={{
          backgroundImage: `radial-gradient(${dots} 1px, transparent 1px)`,
          backgroundSize: "14px 14px",
        }}
      />
      <div className={`absolute bottom-[12%] ${flip ? "right-[6%]" : "left-[6%]"} h-12 w-12 rounded-full border border-brand-primary/15`}>
        <span className="absolute left-1/2 top-1/2 h-px w-6 -translate-x-1/2 bg-brand-primary/20" />
        <span className="absolute left-1/2 top-1/2 h-6 w-px -translate-y-1/2 bg-brand-primary/20" />
      </div>
      <div className={`absolute top-[42%] ${flip ? "left-[3%]" : "right-[3%]"} hidden items-center gap-3 md:flex`}>
        <span className={`h-px w-20 ${quietLine}`} />
        <span className={`h-3 w-3 rotate-45 border ${quietBorder}`} />
      </div>
      <div className={`absolute top-[61%] ${flip ? "right-0 border-l" : "left-0 border-r"} h-28 w-7 border-y ${quietBorder}`} />
      <div className={`absolute top-[72%] ${flip ? "left-[8%]" : "right-[8%]"} hidden h-16 w-16 rounded-full border ${quietBorder} md:block`}>
        <span className={`absolute left-1/2 top-1/2 h-px w-24 -translate-x-1/2 -rotate-12 ${quietLine}`} />
      </div>
    </div>
  );
};

