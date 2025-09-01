"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const WeeklyReflections = () => {
  const { user } = useAuth(); // ✅ use user, not token
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReflection = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/weekly-reflection/latest`,
          {
            method: "GET",
            credentials: "include", // ✅ cookies for auth
          }
        );
        if (!res.ok) throw new Error("Failed to load reflection");
        const data = await res.json();
        setReflection(data.content);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load reflection");
      } finally {
        setLoading(false);
      }
    };

    if (user) loadReflection(); // ✅ check for user
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
