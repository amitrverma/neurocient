import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import ScanResultStory from "./ScanResultStory";
import { questionsBank } from "./questionsBank";

afterEach(cleanup);
const answers = (flexible = false) => questionsBank.map((question) => {
  const option = question.options.find((item) => item.evidence?.optionId === `${question.id}-${flexible ? 5 : 1}`)!;
  return { ...option, science: option.science ?? null };
});

describe("Scan result experience", () => {
  it("establishes the presence of the Inner Caveman before explaining Neurocient", () => {
    const onUnlock = vi.fn();
    render(<ScanResultStory responses={answers()} onUnlock={onUnlock} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("You saw your Inner Caveman in everyday life.");
    expect(screen.getByText(/evolved automatic processing/)).toBeTruthy();
    expect(screen.queryByText(/changed the angle|look irrational/i)).toBeNull();
    expect(screen.getByText("Immediate reward")).toBeTruthy();
    expect(screen.getByText("Low energy and built-up stress")).toBeTruthy();
    expect(screen.queryByText(answers()[0].label)).toBeNull();
    expect(screen.getByRole("heading", { name: "Identity" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Knowledge" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Environment" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Action" })).toBeTruthy();
    expect(screen.getByText("In development")).toBeTruthy();
    expect(onUnlock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Log in to get started" }));
    expect(onUnlock).toHaveBeenCalledOnce();
  });

  it("does not turn the answer mix into a dominant-drive or recurring-pattern result", () => {
    render(<ScanResultStory responses={answers()} onUnlock={vi.fn()} />);
    expect(screen.queryByText(/Planning and organising/)).toBeNull();
    expect(screen.queryByText(/primary|dominant/i)).toBeNull();
    expect(screen.queryByText(/does not rank|does not say which drive|are unimportant/i)).toBeNull();
  });

  it("offers a comfortable exit when no Inner Caveman response appears", () => {
    render(<ScanResultStory responses={answers(true)} onUnlock={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("deliberate choice");
    expect(screen.getByRole("link", { name: "Finish" }).getAttribute("href")).toBe("/");
    expect(screen.queryByText("What the Scan found")).toBeNull();
  });

  it("shows the Inner Caveman when one selected answer contains an automatic response", () => {
    const responses = answers(true);
    responses[0] = answers()[0];
    render(<ScanResultStory responses={responses} onUnlock={vi.fn()} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("You saw your Inner Caveman in everyday life.");
  });

  it("waits for account readiness and then offers the product to signed-in users", () => {
    const onUnlock = vi.fn();
    const { rerender } = render(<ScanResultStory responses={answers()} ready={false} onUnlock={onUnlock} />);
    const pending = screen.getByRole("button", { name: "Checking your account…" }) as HTMLButtonElement;
    expect(pending.disabled).toBe(true);
    rerender(<ScanResultStory responses={answers()} signedIn onUnlock={onUnlock} />);
    fireEvent.click(screen.getByRole("button", { name: "Open Spot the Caveman" }));
    expect(onUnlock).toHaveBeenCalledOnce();
  });

  it("keeps scientific detail optional", () => {
    render(<ScanResultStory responses={answers()} onUnlock={vi.fn()} />);
    expect(screen.getByText(/The science: habits/).closest("details")?.open).toBe(false);
    expect(screen.queryByText("Back to Neurocient")).toBeNull();
    expect(screen.queryByText("Retake the Scan")).toBeNull();
  });
});
