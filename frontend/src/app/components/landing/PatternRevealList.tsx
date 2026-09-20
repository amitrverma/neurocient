const patterns = [
  "Constant distraction.",
  "Persistent pressure.",
  "Endless comparison.",
  "Delaying what matters.",
  "Unceasing guilt.",
  "Growing disconnection.",
  "Too much on your mind.",
];

export default function PatternRevealList() {
  return (
    <ul
      className="grid gap-x-10 py-6 font-serif text-xl font-bold leading-8 text-brand-dark sm:grid-cols-2 md:max-w-5xl md:py-8 md:text-2xl md:leading-9"
    >
      {patterns.map((pattern) => (
        <li
          key={pattern}
          className="flex items-baseline gap-3 border-b border-brand-dark/10 py-2 first:pt-0 last:border-b-0 last:pb-0"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary"
          />
          <span>{pattern}</span>
        </li>
      ))}
    </ul>
  );
}
