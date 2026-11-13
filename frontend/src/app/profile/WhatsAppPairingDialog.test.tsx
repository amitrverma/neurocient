import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import WhatsAppPairingDialog from "./WhatsAppPairingDialog";

describe("WhatsAppPairingDialog", () => {
  afterEach(cleanup);

  it("offers a phone QR handoff and a direct WhatsApp link", () => {
    const onClose = vi.fn();
    const whatsappUrl = "https://wa.me/919999999999?text=connect";

    render(
      <WhatsAppPairingDialog
        open
        whatsappUrl={whatsappUrl}
        onClose={onClose}
      />,
    );

    expect(screen.getByRole("heading", { name: "Continue on WhatsApp" })).toBeInTheDocument();
    expect(screen.getByText(
      "Tap Open WhatsApp below to continue in the app. Send the prepared message within 10 minutes.",
    )).toHaveClass("sm:hidden");
    expect(screen.getByText(
      "Select Open WhatsApp below to continue in WhatsApp Web on this computer, or scan the code to continue in the app on your phone. Send the prepared message within 10 minutes.",
    )).toBeInTheDocument();
    expect(screen.queryByText(/confirms that the WhatsApp number belongs to you/i)).not.toBeInTheDocument();
    expect(screen.getByTitle("Scan to connect WhatsApp")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open WhatsApp" })).toHaveAttribute("href", whatsappUrl);

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders nothing when closed", () => {
    render(<WhatsAppPairingDialog open={false} whatsappUrl="" onClose={vi.fn()} />);
    expect(screen.queryByRole("heading", { name: "Continue on WhatsApp" })).not.toBeInTheDocument();
  });
});
