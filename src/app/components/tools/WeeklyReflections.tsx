"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const WeeklyReflections = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReflection = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/weekly-reflection/latest`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load reflection");
        const data = await res.json();
        setReflection(data.content);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadReflection();
  }, [token]);

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h3 className="text-lg font-semibold text-[#042a2b] mb-2">Weekly Reflection</h3>
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">Error: {error}</p>}
      {!loading && !error && reflection && (
        <div className="mt-2 bg-yellow-50 p-4 border-l-4 border-yellow-400 whitespace-pre-line text-[#333]">
          {reflection}
        </div>
      )}
    </div>
  );
};

export default WeeklyReflections;
