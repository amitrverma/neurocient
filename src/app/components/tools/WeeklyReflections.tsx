"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const WeeklyReflections = () => {
  const { user } = useAuth(); // ✅ only run when logged in
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReflection = async () => {
      try {
        // 🔄 now call your Next.js proxy
        const res = await fetch("/api/weekly-reflection/latest", {
          method: "GET",
          credentials: "include", // ✅ keep cookies
        });
        if (!res.ok) throw new Error("Failed to load reflection");
        const data = await res.json();
        setReflection(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reflection");
      } finally {
        setLoading(false);
      }
    };

    if (user) loadReflection();
  }, [user]);

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h3 className="text-lg font-semibold text-[#042a2b] mb-2">
        Weekly Reflection
      </h3>
      {loading && <p className="text-sm text-brand-dark">Loading...</p>}
      {error && <p className="text-sm text-red-600">Error: {error}</p>}
      {!loading && !error && reflection && (
        <div className="mt-2 bg-yellow-50 p-4 border-l-4 border-yellow-400 whitespace-pre-line text-brand-dark">
          {reflection}
        </div>
      )}
    </div>
  );
};

export default WeeklyReflections;
