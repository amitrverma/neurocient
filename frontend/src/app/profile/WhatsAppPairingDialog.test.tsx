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
    expect(screen.getByText(/Scan this code with your phone/i)).toBeInTheDocument();
    expect(screen.getByText(/confirms that the WhatsApp number belongs to you/i)).toBeInTheDocument();
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
