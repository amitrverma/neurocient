import type { FormEvent, ReactNode } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, RefreshCw } from "lucide-react";

export const AdminPageIntro = ({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-wrap items-end justify-between gap-5">
    <div>
      <p className="page-eyebrow text-brand-teal">{eyebrow}</p>
      <h1 className="page-section-title mt-2">{title}</h1>
      {description ? (
        <p className="mt-3 max-w-3xl font-sans text-sm leading-7 text-brand-dark/65">
          {description}
        </p>
      ) : null}
    </div>
    {action}
  </div>
);

export const AdminState = ({
  loading,
  error,
  empty,
  onRetry,
  children,
}: {
  loading: boolean;
  error: string;
  empty?: string;
  onRetry: () => void;
  children: ReactNode;
}) => {
  if (loading) {
    return (
      <div className="mt-8 flex min-h-40 items-center justify-center rounded-xl border border-brand-dark/10 bg-white" aria-live="polite">
        <LoaderCircle className="h-6 w-6 animate-spin text-brand-accent" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="mt-8 rounded-xl border border-red-900/15 bg-white p-6" role="alert">
        <p className="font-sans text-sm text-red-800">{error}</p>
        <button type="button" onClick={onRetry} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-dark px-4 py-2 font-sans text-sm font-semibold">
          <RefreshCw className="h-4 w-4" /> Try again
        </button>
      </div>
    );
  }
  if (empty) {
    return <p className="mt-8 rounded-xl border border-dashed border-brand-dark/20 bg-white p-8 font-sans text-sm text-brand-dark/60">{empty}</p>;
  }
  return <>{children}</>;
};

export const MetricCard = ({ label, value, note }: { label: string; value: number; note?: string }) => (
  <div className="rounded-xl border border-brand-dark/10 bg-white p-5 shadow-sm">
    <p className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-brand-teal">{label}</p>
    <p className="mt-3 text-4xl font-bold leading-none text-brand-dark">{value.toLocaleString("en-IN")}</p>
    {note ? <p className="mt-3 font-sans text-xs leading-5 text-brand-dark/55">{note}</p> : null}
  </div>
);

export const StatusBadge = ({ value }: { value: string }) => (
  <span className="inline-flex rounded-full bg-brand-dark/[0.06] px-2.5 py-1 font-sans text-[0.7rem] font-bold uppercase tracking-wider text-brand-dark">
    {value.replaceAll("_", " ")}
  </span>
);

export const SearchForm = ({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  placeholder: string;
}) => (
  <form onSubmit={onSubmit} className="mt-7 flex max-w-xl gap-2" role="search">
    <label className="sr-only" htmlFor="admin-search">Search</label>
    <input
      id="admin-search"
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="min-h-11 min-w-0 flex-1 rounded-lg border border-brand-dark/15 bg-white px-4 font-sans text-sm outline-none focus:border-brand-teal"
    />
    <button className="min-h-11 rounded-lg bg-brand-dark px-5 font-sans text-sm font-semibold text-white">Search</button>
  </form>
);

export const Pagination = ({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) => {
  const pages = Math.max(Math.ceil(total / pageSize), 1);
  if (pages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-between gap-4 font-sans text-sm">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-dark/15 px-4 font-semibold disabled:opacity-35">
        <ArrowLeft className="h-4 w-4" /> Previous
      </button>
      <span className="text-brand-dark/60">Page {page} of {pages}</span>
      <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-dark/15 px-4 font-semibold disabled:opacity-35">
        Next <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export const formatDate = (value?: string | null) => value
  ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value))
  : "—";
