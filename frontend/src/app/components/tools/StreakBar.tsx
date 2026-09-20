"use client";

const StreakBar = ({
  current,
  longest,
}: {
  current: number;
  longest: number;
}) => (
  <div className="grid gap-4 rounded-lg border border-brand-dark/10 bg-white p-5 shadow-sm sm:grid-cols-2">
    <div>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
        Current streak
      </p>
      <p className="mt-2 text-4xl font-bold leading-none text-brand-dark">
        {current}
        <span className="ml-2 font-sans text-sm font-semibold text-brand-dark/55">
          day{current !== 1 ? "s" : ""}
        </span>
      </p>
    </div>
    <div className="border-t border-brand-dark/10 pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
        Longest streak
      </p>
      <p className="mt-2 text-4xl font-bold leading-none text-brand-dark">
        {longest}
        <span className="ml-2 font-sans text-sm font-semibold text-brand-dark/55">
          day{longest !== 1 ? "s" : ""}
        </span>
      </p>
    </div>
  </div>
);

export default StreakBar;
