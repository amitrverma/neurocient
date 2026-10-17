import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ScanResultStory from "./ScanResultStory";
import { questionsBank } from "./questionsBank";
import { buildScanReflections, publicScanReflections } from "./scanReflections";

afterEach(cleanup);
const answers = (type: "caveman" | "modern") => questionsBank.map((question) => {
  const option = question.options.find((item) => item.type === type)!;
  return { ...option, science: option.science ?? null };
});

describe("Scan result experience", () => {
  it("reflects a stable sample of the user's actual Inner Caveman answers", () => {
    const responses = answers("caveman");
    const sample = publicScanReflections(responses);
    const onUnlock = vi.fn();
    render(<ScanResultStory responses={responses} onUnlock={onUnlock} />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("You brought your Inner Caveman into view.");
    sample.forEach(({ selectedAnswer, question }) => {
      expect(screen.getByText(selectedAnswer)).toBeTruthy();
      expect(screen.getByText(question)).toBeTruthy();
    });
    expect(screen.getAllByText(/Reflection 0/)).toHaveLength(3);
    expect(screen.getByText(/not combined them into a diagnosis/i)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Save to My Inner Caveman" }));
    expect(onUnlock).toHaveBeenCalledOnce();
  });

  it("does not present a drive, score, type, or person-level synthesis", () => {
    render(<ScanResultStory responses={answers("caveman")} onUnlock={vi.fn()} />);
    expect(screen.queryByText(/dominant drive|primary response|your type|your score/i)).toBeNull();
    expect(screen.getByText(/not a score, a type, or a hidden pattern/i)).toBeTruthy();
  });

  it("does not manufacture an Inner Caveman result from deliberate answers", () => {
    render(<ScanResultStory responses={answers("modern")} onUnlock={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("more deliberate response");
    expect(screen.getByText(/We will not invent one/i)).toBeTruthy();
    expect(screen.queryByText("A few answers to return to")).toBeNull();
  });

  it("shows every relevant Scan answer in the saved My Inner Caveman experience", () => {
    const responses = answers("caveman");
    render(<ScanResultStory responses={responses} mode="saved" signedIn onUnlock={vi.fn()} />);
    expect(screen.getAllByText(/Reflection \d+/)).toHaveLength(buildScanReflections(responses).length);
    expect(screen.queryByText(/stable selection from your completed Scan/i)).toBeNull();
    expect(screen.getByRole("button", { name: "Record a real-life situation" })).toBeTruthy();
  });

  it("waits for account readiness and then continues into My Inner Caveman", () => {
    const onUnlock = vi.fn();
    const { rerender } = render(<ScanResultStory responses={answers("caveman")} ready={false} onUnlock={onUnlock} />);
    const pending = screen.getByRole("button", { name: "Checking your account…" }) as HTMLButtonElement;
    expect(pending.disabled).toBe(true);
    rerender(<ScanResultStory responses={answers("caveman")} signedIn onUnlock={onUnlock} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue to My Inner Caveman" }));
    expect(onUnlock).toHaveBeenCalledOnce();
  });

  it("keeps the platform transition and a comfortable exit available", () => {
    render(<ScanResultStory responses={answers("caveman")} onUnlock={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /Knowing the more rational response/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Insights" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Tools" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Practice" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Programs" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Return to Neurocient" }).getAttribute("href")).toBe("/");
  });
});
