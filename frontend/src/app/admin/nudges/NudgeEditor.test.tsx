import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import NudgeEditor, { buildWhatsappPreview } from "./NudgeEditor";
import type { Nudge } from "./types";

afterEach(cleanup);

describe("NudgeEditor", () => {
  it("builds the same concise WhatsApp body shown by the admin preview", () => {
    expect(
      buildWhatsappPreview({
        title: "A useful title",
        paragraphs: ["First paragraph.", "Second paragraph."],
        quote: "Useful quote.",
        link: null,
        is_active: true,
      }),
    ).toBe("A useful title\n\nFirst paragraph.\n\nSecond paragraph.\n\nUseful quote.");
  });

  it("normalizes editor input before creating a nudge", async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    render(<NudgeEditor nudge={null} saving={false} error="" onSave={save} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Nudge title"), { target: { value: "  Notice this  " } });
    fireEvent.change(screen.getByLabelText("Nudge paragraphs"), { target: { value: " First. \n\n Second. " } });
    fireEvent.change(screen.getByLabelText("Nudge quote"), { target: { value: " Keep what works. " } });
    fireEvent.click(screen.getByRole("button", { name: "Create nudge" }));

    await waitFor(() => expect(save).toHaveBeenCalledWith({
      title: "Notice this",
      paragraphs: ["First.", "Second."],
      quote: "Keep what works.",
      link: null,
      is_active: true,
    }));
  });

  it("locks published content while allowing future eligibility to change", () => {
    const nudge: Nudge = {
      id: "nudge-1",
      title: "Published today",
      paragraphs: ["Stable body"],
      quote: null,
      link: null,
      is_active: true,
      created_at: "2026-11-13T00:00:00",
      last_selected_on: "2026-11-13",
      selected_today: true,
      whatsapp_preview: "Published today\n\nStable body",
    };
    render(<NudgeEditor nudge={nudge} saving={false} error="" onSave={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText("Nudge title")).toBeDisabled();
    expect(screen.getByLabelText("Nudge paragraphs")).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Eligible for daily selection" })).toBeEnabled();
    expect(screen.getByText(/content is locked until tomorrow/i)).toBeInTheDocument();
  });
});
