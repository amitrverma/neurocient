import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  razorpayOptions: null as Record<string, unknown> | null,
  failureHandler: null as ((response: unknown) => void) | null,
  open: vi.fn(),
}));

vi.mock("@/app/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "user-1", email: "member@example.test" },
    ready: true,
  }),
}));
vi.mock("@/app/components/AuthModal", () => ({
  default: () => null,
}));

import Pricing from "./Pricing";

const cohort = {
  id: "cohort-1",
  title: "Modern Caveman — January",
  starts_at: "2027-01-15T12:00:00Z",
  timezone: "Asia/Kolkata",
  capacity: 20,
  seats_remaining: 10,
  price_minor: 2_100_000,
  currency: "INR",
  enrollment_open: true,
  waitlist_available: false,
  checkout_configured: true,
};

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

describe("Modern Caveman checkout", () => {
  beforeEach(() => {
    mocks.razorpayOptions = null;
    mocks.failureHandler = null;
    mocks.open.mockReset();
    window.Razorpay = function Razorpay(options: Record<string, unknown>) {
      mocks.razorpayOptions = options;
      return {
        open: mocks.open,
        on: (_event: string, handler: (response: unknown) => void) => {
          mocks.failureHandler = handler;
        },
      };
    } as typeof window.Razorpay;
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    delete window.Razorpay;
    document
      .querySelectorAll('script[data-neurocient-razorpay="true"]')
      .forEach((script) => script.remove());
  });

  it("verifies the provider callback server-side without claiming capture", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort });
      if (url === "/api/cohorts/cohort-1/checkout") {
        return response({
          key_id: "rzp_test_public",
          order_id: "order_server",
          amount: 2_100_000,
          currency: "INR",
          cohort_title: cohort.title,
          email: "member@example.test",
        });
      }
      if (url === "/api/cohorts/cohort-1/checkout/verify" && init?.method === "POST") {
        expect(JSON.parse(String(init.body))).toEqual({
          razorpay_payment_id: "pay_1",
          razorpay_order_id: "order_server",
          razorpay_signature: "signed",
        });
        return response({ verified: true, confirmed: false });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<Pricing />);

    fireEvent.click(await screen.findByRole("button", { name: /reserve my place/i }));
    await waitFor(() => expect(mocks.open).toHaveBeenCalledOnce());

    const handler = mocks.razorpayOptions?.handler as (payload: unknown) => Promise<void>;
    await handler({
      razorpay_payment_id: "pay_1",
      razorpay_order_id: "order_server",
      razorpay_signature: "signed",
    });

    expect(await screen.findByText(/payment authenticated/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reserve my place/i })).toBeEnabled();
  });

  it("does not show success when server signature verification fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort });
      if (url.endsWith("/checkout")) {
        return response({
          key_id: "rzp_test_public",
          order_id: "order_server",
          amount: 2_100_000,
          currency: "INR",
          cohort_title: cohort.title,
          email: "member@example.test",
        });
      }
      return response({ detail: { code: "invalid_payment_signature" } }, 400);
    }));
    render(<Pricing />);

    fireEvent.click(await screen.findByRole("button", { name: /reserve my place/i }));
    await waitFor(() => expect(mocks.open).toHaveBeenCalledOnce());
    const handler = mocks.razorpayOptions?.handler as (payload: unknown) => Promise<void>;
    await handler({
      razorpay_payment_id: "pay_1",
      razorpay_order_id: "order_server",
      razorpay_signature: "tampered",
    });

    expect(await screen.findByText(/could not authenticate/i)).toBeInTheDocument();
    expect(screen.queryByText(/payment authenticated/i)).not.toBeInTheDocument();
  });

  it("shows a recoverable message on payment failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/cohorts/modern-caveman") return response({ cohort });
      return response({
        key_id: "rzp_test_public",
        order_id: "order_server",
        amount: 2_100_000,
        currency: "INR",
        cohort_title: cohort.title,
        email: "member@example.test",
      });
    }));
    render(<Pricing />);

    fireEvent.click(await screen.findByRole("button", { name: /reserve my place/i }));
    await waitFor(() => expect(mocks.failureHandler).not.toBeNull());
    mocks.failureHandler?.({});

    expect(await screen.findByText(/payment was not completed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reserve my place/i })).toBeEnabled();
  });

  it("refreshes seats and replaces checkout after capture is confirmed", async () => {
    let cohortReads = 0;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") {
        cohortReads += 1;
        return response({
          cohort: { ...cohort, seats_remaining: cohortReads === 1 ? 10 : 9 },
        });
      }
      if (url === "/api/cohorts/my") return response({ enrollments: [] });
      if (url.endsWith("/checkout/verify")) {
        return response({ verified: true, confirmed: true });
      }
      if (url.endsWith("/checkout")) {
        return response({
          key_id: "rzp_test_public",
          order_id: "order_server",
          amount: 2_100_000,
          currency: "INR",
          cohort_title: cohort.title,
          email: "member@example.test",
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));
    render(<Pricing />);

    fireEvent.click(await screen.findByRole("button", { name: /reserve my place/i }));
    await waitFor(() => expect(mocks.open).toHaveBeenCalledOnce());
    const handler = mocks.razorpayOptions?.handler as (payload: unknown) => Promise<void>;
    await handler({
      razorpay_payment_id: "pay_1",
      razorpay_order_id: "order_server",
      razorpay_signature: "signed",
    });

    expect(await screen.findByText("9 of 20 places available")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("You're in.")).toBeInTheDocument();
    expect(screen.getByText(/your place in modern caveman .* january is confirmed/i)).toBeInTheDocument();
    expect(screen.getByText("No further action is needed right now.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reserve my place/i })).not.toBeInTheDocument();
  });

  it("restores the reserved state for an existing paid enrollment", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort });
      if (url === "/api/cohorts/my") {
        return response({
          enrollments: [{ status: "paid", cohort: { id: cohort.id } }],
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));
    render(<Pricing />);

    expect(await screen.findByText("You're in.")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/your place in modern caveman .* january is confirmed/i)).toBeInTheDocument();
    expect(screen.getByText("No further action is needed right now.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reserve my place/i })).not.toBeInTheDocument();
  });
});
