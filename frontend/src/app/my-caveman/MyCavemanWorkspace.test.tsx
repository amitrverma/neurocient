import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { questionsBank } from "@/app/diagnostics/caveman-scan/questionsBank";
import MyCavemanWorkspace from "./MyCavemanWorkspace";

afterEach(cleanup);

const answers = (type: "caveman" | "modern") => questionsBank.map((question) => {
  const option = question.options.find((candidate) => candidate.type === type)!;
  return { ...option, science: option.science ?? null };
});

describe("MyCavemanWorkspace", () => {
  it("uses the signed-in workspace hierarchy and canonical product routes", () => {
    render(<MyCavemanWorkspace responses={answers("caveman")} onRetake={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1, name: "My Inner Caveman" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Spot the Inner Caveman/i }).getAttribute("href")).toBe("/tools/spots");
    expect(screen.getByRole("link", { name: /Explore Insights/i }).getAttribute("href")).toBe("/insights");
    expect(screen.getByRole("link", { name: /Continue with Practice/i }).getAttribute("href")).toBe("/practice");
    expect(screen.queryByText(/What Neurocient adds/i)).toBeNull();
  });

  it("keeps every Scan reflection available through progressive disclosure", () => {
    render(<MyCavemanWorkspace responses={answers("caveman")} onRetake={vi.fn()} />);
    expect(screen.getAllByText(/More deliberate response/).length).toBeGreaterThan(1);
    expect(screen.getAllByText(/\d{2}/).length).toBeGreaterThan(1);
  });

  it("does not invent a result when all answers were deliberate", () => {
    render(<MyCavemanWorkspace responses={answers("modern")} onRetake={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /more deliberate response/i })).toBeTruthy();
    expect(screen.getByText(/will not invent one/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Record a real-life situation/i }).getAttribute("href")).toBe("/tools/spots");
  });

  it("keeps retaking an explicit secondary action", () => {
    const onRetake = vi.fn();
    render(<MyCavemanWorkspace responses={answers("caveman")} onRetake={onRetake} />);
    fireEvent.click(screen.getByRole("button", { name: "Retake the Scan" }));
    expect(onRetake).toHaveBeenCalledOnce();
  });
});
