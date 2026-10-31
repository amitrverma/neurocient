import type { ReactNode } from "react";

export const Panel = ({ children }: { children: ReactNode }) => (
  <div className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm md:p-8">
    {children}
  </div>
);

export const SectionKicker = ({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex items-center gap-3">
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
      {icon}
    </span>
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
      {children}
    </p>
  </div>
);

export const InfoTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-brand-dark/12 p-4">
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-brand-teal">
      {label}
    </p>
    <p className="mt-2 break-words font-sans text-sm font-semibold text-brand-dark">
      {value}
    </p>
  </div>
);
