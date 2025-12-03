"use client";

interface Props {
  responses: { type: "caveman" | "modern"; reflection: string }[];
}

const CavemanScanResult = ({ responses }: Props) => {
  const cavemanCount = responses.filter(r => r.type === "caveman").length;
  const total = responses.length;
  const cavemanPercent = Math.round((cavemanCount / total) * 100);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-brand-dark">
      <h2 className="text-3xl font-bold mb-4 text-brand-accent">Your Caveman Snapshot</h2>

      <p className="text-lg mb-4">
        {cavemanPercent}% Caveman · {100 - cavemanPercent}% Modern
      </p>

      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden mb-8">
        <div
          className="h-3 bg-brand-accent"
          style={{ width: `${cavemanPercent}%` }}
        />
      </div>

      <p className="mb-4 text-brand-dark/80">
        This isn’t a score — it’s a snapshot of how your instinctive system is 
        influencing your decisions right now.
      </p>

      <p className="text-brand-primary font-semibold">
        Awareness is the first shift.
      </p>
    </div>
  );
};

export default CavemanScanResult;
