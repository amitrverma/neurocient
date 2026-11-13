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
      "Scan the code with your phone to open WhatsApp, or use the button below. Send the prepared message within 10 minutes to connect your account.",
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
