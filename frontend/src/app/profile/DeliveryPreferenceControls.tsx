"use client";

import type { ReactNode } from "react";

export const DeliveryChannel = ({ title, text, status, action, secondaryAction }: {
  title: string;
  text: ReactNode;
  status: string;
  action: ReactNode;
  secondaryAction?: ReactNode;
}) => (
  <div className="py-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-sans text-sm font-semibold text-brand-dark">{title}</h3>
          <span className="rounded-full bg-brand-dark/6 px-2.5 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-dark/60">
            {status}
          </span>
        </div>
        <div className="mt-2 max-w-2xl font-sans text-sm leading-6 text-brand-dark/68">{text}</div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        {action}
        {secondaryAction}
      </div>
    </div>
  </div>
);

export const ChannelButton = ({ children, onClick, disabled = false, quiet = false }: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  quiet?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={quiet
      ? "rounded-full border border-brand-dark/20 px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-dark/50 disabled:opacity-40"
      : "rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary disabled:opacity-40"}
  >
    {children}
  </button>
);
