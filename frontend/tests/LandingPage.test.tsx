import React from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import LandingPage from "../src/app/components/LandingPage";

beforeAll(() => {
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
});

afterEach(cleanup);

describe("Landing page platform narrative", () => {
  it("identifies Neurocient early and keeps the six recognition patterns visible", () => {
    render(<LandingPage />);

    expect(
      screen.getByText(/behaviour-change platform to bridge the gap between knowing and doing/i),
    ).toBeInTheDocument();

    [
      "Waiting to feel ready",
      "Escaping into the scroll",
      "Measuring yourself against others",
      "Pressure that never switches off",
      "Worries that never leave",
      "The guilt that does not go away",
    ].forEach((title) => {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    });

    expect(screen.queryByRole("heading", { name: "Rest that does not restore" })).not.toBeInTheDocument();
    expect(screen.getByText(/not always\. not completely/i)).toBeInTheDocument();
    expect(screen.getByText(/that version of/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /find your question/i })).toHaveAttribute(
      "href",
      "/insights",
    );
    expect(screen.getByText(/followed more advice than you can remember/i)).toBeInTheDocument();
  });

  it("offers a personal starting point and the fuller Inner Caveman explanation", () => {
    const { container } = render(<LandingPage />);

    const scanLinks = screen.getAllByRole("link", { name: /take the 5-minute inner caveman scan/i });
    expect(scanLinks).toHaveLength(2);
    scanLinks.forEach((link) => expect(link).toHaveAttribute("href", "/diagnostics/caveman-scan"));

    const innerCavemanSection = container.querySelector("#inner-caveman");
    expect(innerCavemanSection).not.toBeNull();
    expect(
      within(innerCavemanSection as HTMLElement).queryByRole("link", {
        name: /take the 5-minute inner caveman scan/i,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /read the full inner caveman explanation/i }),
    ).toHaveAttribute("href", "/inner-caveman");
  });

  it("presents the platform as a connected system with working entry links", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: /how neurocient helps/i })).toBeInTheDocument();
    expect(
      screen.getByText(/neurocient helps you move from something you understand to something you live/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore insights/i })).toHaveAttribute(
      "href",
      "/insights",
    );
    expect(screen.getByRole("link", { name: /explore tools/i })).toHaveAttribute(
      "href",
      "/tools",
    );
    expect(screen.getByText(/spot the inner caveman and microchallenges/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open practice/i })).toHaveAttribute(
      "href",
      "/practice",
    );
    expect(screen.getByRole("link", { name: /explore programs/i })).toHaveAttribute(
      "href",
      "/programs",
    );
    expect(screen.getByText("Identity")).toBeInTheDocument();
    expect(screen.getByText("Knowledge")).toBeInTheDocument();
    expect(screen.getByText("Environment")).toBeInTheDocument();
    expect(screen.getByText("Action")).toBeInTheDocument();
    expect(screen.getByText("Reinforcement")).toBeInTheDocument();
  });

  it("describes automatic processing without assigning it intention or agency", () => {
    const { container } = render(<LandingPage />);
    const copy = container.textContent ?? "";

    expect(copy).toMatch(/evolved automatic processing/i);
    expect(copy).not.toMatch(/\bprotect(?:s|ive|ion)?\b/i);
    expect(copy).not.toMatch(/what it(?:'|’)s trying to protect/i);
    expect(copy).not.toMatch(/responds when it believes/i);
  });

  it("keeps the original usual-response argument beneath the revised heading", () => {
    render(<LandingPage />);

    expect(screen.getByRole("heading", { name: /you tried to solve it from the outside/i })).toBeInTheDocument();
    expect(screen.getByText(/when something isn.t working, the response is almost automatic/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Productivity systems" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Motivation hacks" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Self-discipline advice" })).toBeInTheDocument();
    expect(screen.getByText(/once you know better, you will do better/i)).toBeInTheDocument();
    expect(screen.getByText(/and slowly, the problem starts to feel like you/i)).toBeInTheDocument();
  });

  it("moves from the Inner Caveman overview into the complete platform without a false ending", () => {
    const { container } = render(<LandingPage />);

    expect(screen.getByText(/the gap between knowing and doing isn.t simply about willpower, discipline, or motivation/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /rooted in evolutionary psychology, neurocient labs helps you understand/i })).toBeInTheDocument();
    expect(screen.getByText("why you do what you do")).toBeInTheDocument();
    expect(screen.getByText("why modern approaches often fall short")).toBeInTheDocument();
    expect(screen.getByText("what needs to change at the source")).toBeInTheDocument();
    expect(screen.getByText(/begin with the system shaping the response/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /meet your inner caveman/i })).toBeInTheDocument();
    expect(screen.getByText(/every person has all five drives/i)).toBeInTheDocument();
    expect(screen.getByText(/you can.t delete your inner caveman/i)).toBeInTheDocument();
    expect(screen.queryByText(/the research and practical method/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/grounded in decades of research/i)).not.toBeInTheDocument();

    const innerCavemanSection = container.querySelector("#inner-caveman");
    const platformSection = container.querySelector("#how-neurocient-helps");
    expect(innerCavemanSection).not.toBeNull();
    expect(platformSection).not.toBeNull();
    expect(
      innerCavemanSection?.compareDocumentPosition(platformSection as Node) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.queryByText(/so we created a simple scan to help you get started/i)).not.toBeInTheDocument();
  });

  it("keeps the main narrative ahead of the optional Insights side path", () => {
    render(<LandingPage />);

    const narrativeTransition = screen.getByText(/followed more advice than you can remember/i);
    const insightsLink = screen.getByRole("link", { name: /find your question/i });

    expect(
      narrativeTransition.compareDocumentPosition(insightsLink) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
