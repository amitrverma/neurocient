import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import DataDeletionPage from "../src/app/data-deletion/page";
import PrivacyPage from "../src/app/privacy/page";
import SupportPage from "../src/app/support/page";
import TermsPage from "../src/app/terms/page";

afterEach(cleanup);

const legalIdentity = /neurocient labs is a unit and brand of xaltris technologies, a sole proprietorship owned and operated by amit ranjan verma in india/i;

describe("public legal and support pages", () => {
  it("identifies the proprietor and provides one support contact on the privacy page", () => {
    render(<PrivacyPage />);

    expect(screen.getByText(legalIdentity)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact support/i })).toHaveAttribute(
      "href",
      "mailto:support@neurocient.com",
    );
    expect(screen.getByRole("link", { name: /data deletion/i })).toHaveAttribute(
      "href",
      "/data-deletion",
    );
    expect(screen.getByText(/whatsapp message content and delivery information/i)).toBeInTheDocument();
    expect(screen.getByText(/reply stop/i)).toBeInTheDocument();
  });

  it("identifies the proprietor and links support and privacy from the terms", () => {
    render(<TermsPage />);

    expect(screen.getByText(legalIdentity)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact support/i })).toHaveAttribute(
      "href",
      "mailto:support@neurocient.com",
    );
    expect(screen.getByRole("link", { name: /read privacy policy/i })).toHaveAttribute(
      "href",
      "/privacy",
    );
  });

  it("offers direct human support without presenting Neurocient as crisis care", () => {
    render(<SupportPage />);

    expect(screen.getByText(legalIdentity)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /email support/i })).toHaveAttribute(
      "href",
      "mailto:support@neurocient.com",
    );
    expect(screen.getByText(/not an emergency or crisis service/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /request data deletion/i })).toHaveAttribute(
      "href",
      "/data-deletion",
    );
  });

  it("publishes usable data-deletion instructions for account and WhatsApp data", () => {
    render(<DataDeletionPage />);

    expect(screen.getByText(legalIdentity)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /send deletion request/i })).toHaveAttribute(
      "href",
      expect.stringContaining("mailto:support@neurocient.com"),
    );
    expect(screen.getAllByText(/connected whatsapp number/i)).not.toHaveLength(0);
    expect(screen.getByText(/payment, tax, fraud-prevention, security, or legal records/i)).toBeInTheDocument();
  });
});
