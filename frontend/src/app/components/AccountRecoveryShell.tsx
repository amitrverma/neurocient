import type { ReactNode } from "react";

export default function AccountRecoveryShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <main className="surface-page flex min-h-[calc(100svh-4rem)] items-center bg-white px-4 py-10 sm:px-6 sm:py-16">
      <section
        aria-labelledby="account-recovery-title"
        className="mx-auto w-full max-w-md rounded-lg border border-brand-dark/10 bg-white p-6 font-sans text-brand-dark shadow-[0_20px_60px_rgba(4,42,43,0.08)] sm:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
          Account recovery
        </p>
        <h1
          id="account-recovery-title"
          className="mt-3 font-sans text-2xl font-bold leading-tight tracking-[-0.015em] text-brand-dark"
        >
          {title}
        </h1>
        {description && (
          <p className="mt-3 font-sans text-sm leading-6 text-brand-dark/70">
            {description}
          </p>
        )}
        {children}
      </section>
    </main>
  );
}
