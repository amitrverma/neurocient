"use client";

import { useEffect, useState } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const WeeklyReflections = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadReflection = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/weekly-reflection/latest", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load reflection");
        const data = await res.json();
        setReflection(data.content || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reflection");
      } finally {
        setLoading(false);
      }
    };

    loadReflection();
  }, [user]);

  return (
    <section className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
          {loading ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
        </span>
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
          Weekly reflection
        </p>
      </div>

      {loading && (
        <p className="mt-5 font-sans text-sm leading-7 text-brand-dark/72">
          Loading your latest reflection.
        </p>
      )}

      {error && (
        <p className="mt-5 font-sans text-sm leading-7 text-brand-primary">
          {error}
        </p>
      )}

      {!loading && !error && reflection && (
        <div className="mt-5 whitespace-pre-line border-l-4 border-brand-secondary pl-5 font-sans text-sm leading-7 text-brand-dark/76 md:text-base md:leading-8">
          {reflection}
        </div>
      )}

      {!loading && !error && !reflection && (
        <p className="mt-5 font-sans text-sm leading-7 text-brand-dark/72">
          No weekly reflection is available yet.
        </p>
      )}
    </section>
  );
};

export default WeeklyReflections;
