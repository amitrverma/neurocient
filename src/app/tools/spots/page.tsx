"use client";

import Link from "next/link";

const SpotsPage = () => {
  // mock data
  const spots = [
    { date: "2025-08-22", description: "Procrastinated tough task until late." },
    { date: "2025-08-20", description: "Avoided conflict though had valid point." },
    { date: "2025-08-18", description: "Checked phone instead of focusing on task." },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#042a2b] mb-6">Caveman Spotting</h1>

      <p className="text-gray-600 mb-6">
        Here you’ll see all the spots you’ve logged, with insights into your recurring instincts.
      </p>

      <ul className="divide-y divide-gray-200 bg-white border rounded-lg shadow-sm">
        {spots.map((s, i) => (
          <li key={i} className="p-4">
            <div className="text-xs text-gray-500 mb-1">
              {new Date(s.date).toLocaleDateString("en-IN", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <p className="text-sm text-[#042a2b]">{s.description}</p>
          </li>
        ))}
      </ul>
{/* After spots list */}
<section className="mt-8">
  <h2 className="text-xl font-semibold text-[#042a2b] mb-3">
    Related Insights
  </h2>
  <ul className="space-y-2">
    <li>
      <Link 
        href="/insights/why-we-avoid-conflict" 
        className="text-sm text-[#5eb1bf] hover:underline"
      >
        Why We Avoid Conflict (and how to reframe it)
      </Link>
    </li>
    <li>
      <Link 
        href="/insights/the-hidden-cost-of-procrastination" 
        className="text-sm text-[#5eb1bf] hover:underline"
      >
        The Hidden Cost of Procrastination
      </Link>
    </li>
  </ul>
</section>

      <div className="mt-6">
        <Link
          href="/tools"
          className="text-sm font-semibold text-[#042a2b] hover:text-[#5eb1bf] underline"
        >
          ← Back to Tools Dashboard
        </Link>
      </div>
    </div>
  );
};

export default SpotsPage;
