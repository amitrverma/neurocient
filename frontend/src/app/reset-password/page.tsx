import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <main className="surface-page min-h-[75vh] px-5 py-16 md:py-24">
      <section className="mx-auto max-w-md rounded-3xl border border-brand-dark/10 bg-white p-7 shadow-sm md:p-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-teal">
          Account recovery
        </p>
        <h1 className="mt-3 font-serif text-3xl text-brand-dark">
          Choose a new password
        </h1>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
