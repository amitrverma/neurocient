"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, FlaskConical, NotebookPen } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";

interface Spot {
  date: string;
  description: string;
}

const toolPaths = [
  {
    number: "01",
    label: "Notice what happened",
    title: "Spots",
    question: "What actually happened in my life?",
    text: "Capture one concrete situation, what you did next, and what the response gave you immediately. Repeated spots turn a vague pattern into evidence you can recognise earlier.",
    useWhen: "Use this after a moment you want to understand—not only after you handled it well.",
    href: "/tools/spots",
    cta: "Record or review a spot",
    icon: NotebookPen,
  },
  {
    number: "02",
    label: "Try something small",
    title: "Microchallenges",
    question: "What small experiment can I try?",
    text: "Choose one modest change to a cue, environment, or action. The purpose is to learn what changes the response in real conditions, not to prove perfect discipline.",
    useWhen: "Use this when you can name the pattern and want to test a different setup.",
    href: "/tools/microchallenges",
    cta: "Choose a microchallenge",
    icon: FlaskConical,
  },
];

export default function ToolsPage() {
  const { user } = useAuth();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(false);
  const [spotLoadFailed, setSpotLoadFailed] = useState(false);

  useEffect(() => {
    if (!user) {
      setSpots([]);
      setSpotLoadFailed(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setSpotLoadFailed(false);

    fetch("/api/spots/", { credentials: "include", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to fetch spots: ${response.status}`);
        return response.json() as Promise<Spot[]>;
      })
      .then(setSpots)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error("Error loading spots:", error);
        setSpotLoadFailed(true);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [user]);

  const latestSpot = [...spots].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )[0];

  return (
    <main className="surface-page tools-page">
      <section className="surface-hero tools-hero">
        <div>
          <p className="surface-eyebrow">Use it in real life</p>
          <h1 className="surface-title">
            Notice the pattern.
            <span>Change one condition.</span>
          </h1>
          <p className="surface-lede">
            These tools bring understanding back into ordinary life: first by
            recording what happened, then by trying a small experiment in the
            conditions that shaped it.
          </p>
        </div>
        <aside className="tools-loop" aria-label="The tools loop">
          <span>One practical loop</span>
          <ol>
            <li><strong>Spot</strong><small>Name the real moment.</small></li>
            <li><strong>Try</strong><small>Change one thing.</small></li>
            <li><strong>Notice again</strong><small>Keep the evidence, not a streak.</small></li>
          </ol>
        </aside>
      </section>

      <section className="surface-section tools-section">
        <header className="surface-section-heading">
          <p className="surface-eyebrow">Choose what you need now</p>
          <h2>Evidence first. Experiment second.</h2>
        </header>
        <div className="tools-grid">
          {toolPaths.map((tool) => {
            const Icon = tool.icon;
            const isSpots = tool.href === "/tools/spots";
            return (
              <Link key={tool.href} href={tool.href} className="tool-path-card">
                <div className="tool-path-top"><span>{tool.number}</span><Icon aria-hidden="true" /></div>
                <p>{tool.label}</p>
                <h2>{tool.title}</h2>
                <h3>{tool.question}</h3>
                <span className="tool-path-copy">{tool.text}</span>
                <blockquote>{tool.useWhen}</blockquote>
                {user && isSpots ? (
                  <div className="tool-personal-state">
                    <small>Your evidence</small>
                    <strong>
                      {loading
                        ? "Loading…"
                        : spotLoadFailed
                          ? "Could not load your spots"
                          : `${spots.length} ${spots.length === 1 ? "spot" : "spots"} recorded`}
                    </strong>
                    {latestSpot ? <span>Latest: “{latestSpot.description}”</span> : null}
                  </div>
                ) : null}
                <strong className="tool-path-link">{tool.cta} <ArrowRight aria-hidden="true" /></strong>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
