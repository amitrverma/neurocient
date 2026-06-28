export const metadata = {
  title: "Practice",
  description:
    "A behavior-change practice surface for turning insight into emotionally lightweight, repeatable action.",
};

export default function PracticePage() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] font-serif text-[#292622]">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-5 py-16 md:py-24">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-[#6f8378]">
          Practice
        </p>
        <h1 className="mt-5 max-w-3xl text-4xl font-normal leading-[1.08] text-[#292622] md:text-6xl">
          A quieter way to work with the loops that take life into autopilot.
        </h1>
        <p className="mt-7 max-w-2xl font-sans text-base leading-8 text-[#4f5f57]">
          This surface is being rebuilt from the ground up. The first free flow
          will focus on procrastination, then hand off to authenticated
          reinforcement, WhatsApp support, and existing progress systems.
        </p>
      </section>
    </main>
  );
}
