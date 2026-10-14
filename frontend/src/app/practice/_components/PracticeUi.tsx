import type { ReactNode } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";

export const Screen = ({
  label,
  title,
  body,
  children,
}: {
  label: string;
  title: string;
  body: string;
  children: ReactNode;
}) => (
  <section className="w-full max-w-3xl">
    <p className="page-eyebrow text-brand-teal">
      {label}
    </p>
    <h1 className="page-title mt-4 text-brand-dark">
      {title}
    </h1>
    <p className="mt-6 max-w-2xl border-l-2 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark/72 md:text-lg md:leading-9">
      {body}
    </p>
    <div className="mt-8 grid gap-6">{children}</div>
  </section>
);

export const ChoiceGrid = ({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) => (
  <div className={`grid gap-3 ${compact ? "sm:grid-cols-2" : ""}`}>
    {children}
  </div>
);

export const ChoiceButton = ({
  selected,
  title,
  detail,
  onClick,
}: {
  selected: boolean;
  title: string;
  detail?: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-h-20 rounded-lg border px-4 py-4 text-left font-sans transition ${
      selected
        ? "border-brand-dark bg-brand-dark text-white"
        : "border-brand-dark/12 bg-white/55 text-brand-dark hover:border-brand-teal/60 hover:bg-white"
    }`}
  >
    <span className="block text-sm font-semibold leading-6">{title}</span>
    {detail ? (
      <span
        className={`mt-2 block text-sm leading-6 ${
          selected ? "text-white/78" : "text-brand-dark/64"
        }`}
      >
        {detail}
      </span>
    ) : null}
  </button>
);

export const PrimaryButton = ({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full bg-brand-dark px-5 py-3 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary disabled:pointer-events-none disabled:opacity-35"
  >
    {children}
    <ArrowRight className="h-4 w-4" aria-hidden="true" />
  </button>
);

export const GhostButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full border border-brand-dark/20 px-5 py-3 font-sans text-sm font-semibold text-brand-dark transition hover:border-brand-teal hover:bg-white/65"
  >
    {children}
  </button>
);

export const InsightLine = ({ children }: { children: ReactNode }) => (
  <p className="max-w-2xl border-y border-brand-dark/10 py-5 font-serif text-2xl italic leading-9 text-brand-dark md:text-3xl md:leading-10">
    {children}
  </p>
);

export const PairBlock = ({
  firstLabel,
  first,
  secondLabel,
  second,
}: {
  firstLabel: string;
  first: string;
  secondLabel: string;
  second: string;
}) => (
  <div className="grid gap-3">
    <section className="rounded-lg border border-brand-accent/25 bg-brand-accent/[0.04] p-4">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-accent">
        {firstLabel}
      </p>
      <p className="mt-3 font-serif text-2xl italic leading-9 text-brand-dark">
        {first}
      </p>
    </section>
    <section className="rounded-lg border border-brand-dark/12 bg-white/55 p-4">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
        {secondLabel}
      </p>
      <p className="mt-3 font-sans text-base leading-8 text-brand-dark/72">
        {second}
      </p>
    </section>
  </div>
);

export const ActionBlock = ({ action }: { action: string }) => (
  <section className="rounded-lg border border-brand-teal/40 bg-brand-teal/[0.04] p-5">
    <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
      Tiny move
    </p>
    <p className="mt-3 font-serif text-3xl italic leading-10 text-brand-dark">
      {action}
    </p>
  </section>
);

export const PreviewMessage = ({ message }: { message: string }) => (
  <section className="max-w-xl rounded-lg border border-brand-dark/14 bg-white/65 p-4">
    <div className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      Future prompt
    </div>
    <p className="mt-3 font-sans text-base leading-8 text-brand-dark">
      {message}
    </p>
  </section>
);

export const SetupItem = ({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) => (
  <section className="flex gap-3 rounded-lg border border-brand-dark/12 bg-white/55 p-4 font-sans">
    <span className="mt-1 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-brand-teal/45 text-brand-teal">
      {icon}
    </span>
    <div>
      <h2 className="text-sm font-semibold text-brand-dark">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-brand-dark/64">{text}</p>
    </div>
  </section>
);
