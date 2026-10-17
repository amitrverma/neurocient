"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, FileText, LoaderCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

type Reflection = {
  content: string;
  week_start?: string;
  week_end?: string;
};

const WeeklyReflections = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [reflection, setReflection] = useState<Reflection | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => setReloadKey((value) => value + 1), []);

  useEffect(() => {
    if (!user) {
      setStatus("empty");
      return;
    }

    let active = true;
    const loadReflection = async () => {
      setStatus("loading");
      setReflection(null);
      try {
        const response = await fetch("/api/weekly-reflection/latest", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (!active) return;
        if (response.status === 404) {
          setStatus("empty");
          return;
        }
        if (!response.ok) throw new Error(`Failed to load reflection: ${response.status}`);
        const data = await response.json();
        if (!active) return;
        if (!data.content) {
          setStatus("empty");
          return;
        }
        setReflection(data);
        setStatus("ready");
      } catch (error) {
        if (!active) return;
        console.error("Failed to load weekly reflection:", error);
        setStatus("error");
      }
    };

    void loadReflection();
    return () => {
      active = false;
    };
  }, [user, reloadKey]);

  if (status === "empty") return null;

  return (
    <section
      className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-sm md:p-8"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
          {status === "loading" ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
        </span>
        <div>
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
            This week’s reflection
          </p>
          {reflection?.week_start && reflection.week_end ? (
            <p className="mt-1 font-sans text-xs text-brand-dark/55">
              {formatWeek(reflection.week_start, reflection.week_end)}
            </p>
          ) : null}
        </div>
      </div>

      {status === "loading" ? (
        <p className="mt-5 font-sans text-sm leading-7 text-brand-dark/72">
          Loading your latest reflection.
        </p>
      ) : null}

      {status === "error" ? (
        <div className="mt-5">
          <p className="font-sans text-sm leading-7 text-brand-dark/72">
            Your weekly reflection could not be loaded. Your activity is still safe.
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark transition hover:bg-brand-dark hover:text-white"
          >
            Try again
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {status === "ready" && reflection ? (
        <div className="mt-5 whitespace-pre-line border-l-4 border-brand-secondary pl-5 font-sans text-sm leading-7 text-brand-dark/76 md:text-base md:leading-8">
          {reflection.content}
        </div>
      ) : null}
    </section>
  );
};

const formatWeek = (start: string, end: string) => {
  const formatter = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  });
  return `${formatter.format(new Date(`${start}T00:00:00`))}–${formatter.format(new Date(`${end}T00:00:00`))}`;
};

export default WeeklyReflections;
