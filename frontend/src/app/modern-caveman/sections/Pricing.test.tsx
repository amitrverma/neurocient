import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  checkout_offers: [
    { offer_id: "inr", amount_minor: 2_100_000, currency: "INR", display_price: "₹21,000", configured: true },
    { offer_id: "usd", amount_minor: 24_900, currency: "USD", display_price: "US$249", configured: true },
  ],
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

  it("shows account-bound payment choices for an unexpired waitlist offer", async () => {
    const fullCohort = {
      ...cohort,
      seats_remaining: 0,
      enrollment_open: false,
      waitlist_available: true,
    };
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort: fullCohort });
      if (url === "/api/cohorts/my") return response({ enrollments: [] });
      if (url.endsWith("/waitlist/status")) {
        return response({
          status: "offered",
          can_checkout: true,
          offer_expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          offer_email_status: "sent",
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));

    render(<Pricing />);

    expect(await screen.findByText(/your waitlist place is available/i)).toBeInTheDocument();
    expect(screen.getByText(/offer belongs to this account/i)).toBeInTheDocument();
    expect(screen.getByText(/one place held for you/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /reserve my place/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /reserve for us\$249/i })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /join the waitlist/i })).not.toBeInTheDocument();
  });

  it("does not expose payment when a waitlist offer is no longer valid", async () => {
    const fullCohort = {
      ...cohort,
      seats_remaining: 0,
      enrollment_open: false,
      waitlist_available: true,
    };
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort: fullCohort });
      if (url === "/api/cohorts/my") return response({ enrollments: [] });
      if (url.endsWith("/waitlist/status")) {
        return response({ status: "offered", can_checkout: false, offer_expires_at: null, offer_email_status: "sent" });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));

    render(<Pricing />);

    expect(await screen.findByRole("button", { name: /join the waitlist/i })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /reserve my place/i })).not.toBeInTheDocument();
  });

  it("does not start the payment clock while the offer email is awaiting delivery", async () => {
    const fullCohort = {
      ...cohort,
      seats_remaining: 0,
      enrollment_open: false,
      waitlist_available: true,
    };
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort: fullCohort });
      if (url === "/api/cohorts/my") return response({ enrollments: [] });
      if (url.endsWith("/waitlist/status")) {
        return response({ status: "offered", can_checkout: false, offer_expires_at: null, offer_email_status: "failed" });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));

    render(<Pricing />);

    expect(await screen.findByText(/place is being prepared/i)).toBeInTheDocument();
    expect(screen.getByText(/24-hour payment window has not started/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reserve my place/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /join the waitlist/i })).not.toBeInTheDocument();
  });

  it("explains when an ambiguous offer email needs review", async () => {
    const fullCohort = { ...cohort, seats_remaining: 0, enrollment_open: false, waitlist_available: true };
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort: fullCohort });
      if (url === "/api/cohorts/my") return response({ enrollments: [] });
      if (url.endsWith("/waitlist/status")) {
        return response({ status: "offered", can_checkout: false, offer_expires_at: null, offer_email_status: "reconciliation_required" });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));

    render(<Pricing />);

    expect(await screen.findByText(/place needs an email check/i)).toBeInTheDocument();
    expect(screen.getByText(/could not confirm whether the payment email was accepted/i)).toBeInTheDocument();
    expect(screen.queryByText(/will email your payment link/i)).not.toBeInTheDocument();
  });

  it("uses Razorpay for both INR and the secondary USD offer", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort });
      if (url === "/api/cohorts/my") return response({ enrollments: [] });
      if (url === "/api/cohorts/cohort-1/checkout" && init?.method === "POST") {
        return response({
          key_id: "rzp_test_public",
          order_id: "order_usd_server_created",
          amount: 24_900,
          currency: "USD",
          offer_id: "usd",
          name: "Neurocient",
          description: "Modern Caveman",
          email: "member@example.test",
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<Pricing />);

    const primary = await screen.findByRole("button", { name: /reserve my place/i });
    const usd = screen.getByRole("button", { name: "Reserve for US$249" });
    expect(primary).toHaveClass("mc-checkout-button");
    expect(usd).toHaveClass("mc-checkout-button--secondary");

    fireEvent.click(usd);
    await waitFor(() => {
      expect(mocks.open).toHaveBeenCalledOnce();
    });
    expect(mocks.razorpayOptions?.order_id).toBe("order_usd_server_created");
    expect(mocks.razorpayOptions?.name).toBe("Neurocient Labs");
    expect(screen.getByText(
      /payments are collected by Xaltris Technologies, operating Neurocient Labs/i,
    )).toBeInTheDocument();
    const checkoutCall = fetchMock.mock.calls.find(([url]) => String(url) === "/api/cohorts/cohort-1/checkout");
    expect(checkoutCall?.[1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ offer_id: "usd" }),
    });
  });

  it("does not open Razorpay when checkout returns a different offer", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort });
      if (url === "/api/cohorts/my") return response({ enrollments: [] });
      if (url === "/api/cohorts/cohort-1/checkout") {
        return response({
          key_id: "rzp_test_public",
          order_id: "order_wrong_offer",
          amount: 2_100_000,
          currency: "INR",
          offer_id: "inr",
          cohort_title: cohort.title,
          email: "member@example.test",
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));
    render(<Pricing />);

    fireEvent.click(await screen.findByRole("button", { name: "Reserve for US$249" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /did not match the currency you selected/i,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/no payment window was opened/i);
    expect(mocks.open).not.toHaveBeenCalled();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    delete window.Razorpay;
    document
      .querySelectorAll('script[data-neurocient-razorpay="true"]')
      .forEach((script) => script.remove());
    document
      .querySelectorAll("iframe.razorpay-checkout-frame, .razorpay-container")
      .forEach((element) => element.remove());
  });

  it("shows a protected confirmation state after the callback is verified", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort });
      if (url === "/api/cohorts/cohort-1/checkout") {
        return response({
          key_id: "rzp_test_public",
          order_id: "order_server",
          amount: 2_100_000,
          currency: "INR",
          offer_id: "inr",
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
      if (url === "/api/cohorts/my") return response({ enrollments: [] });
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<Pricing />);

    fireEvent.click(await screen.findByRole("button", { name: /reserve my place/i }));
    await waitFor(() => expect(mocks.open).toHaveBeenCalledOnce());

    const handler = mocks.razorpayOptions?.handler as (payload: unknown) => Promise<void>;
    await act(async () => {
      await handler({
        razorpay_payment_id: "pay_1",
        razorpay_order_id: "order_server",
        razorpay_signature: "signed",
      });
    });

    expect(await screen.findByRole("status")).toHaveTextContent(/confirming your place/i);
    expect(screen.getByRole("status")).toHaveTextContent(/do not pay again/i);
    expect(screen.queryByRole("button", { name: /reserve my place/i })).not.toBeInTheDocument();
  });

  it("turns the confirmation state into a reservation when capture arrives", async () => {
    vi.useFakeTimers();
    let enrollmentReads = 0;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort });
      if (url === "/api/cohorts/cohort-1/checkout") {
        return response({
          key_id: "rzp_test_public",
          order_id: "order_server",
          amount: 2_100_000,
          currency: "INR",
          offer_id: "inr",
          cohort_title: cohort.title,
          email: "member@example.test",
        });
      }
      if (url === "/api/cohorts/cohort-1/checkout/verify") {
        return response({ verified: true, confirmed: false });
      }
      if (url === "/api/cohorts/my") {
        enrollmentReads += 1;
        return response({
          enrollments: enrollmentReads === 1
            ? []
            : [{ status: "paid", cohort: { id: cohort.id } }],
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));
    render(<Pricing />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole("button", { name: /reserve my place/i }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const handler = mocks.razorpayOptions?.handler as (payload: unknown) => Promise<void>;
    await act(async () => {
      await handler({
        razorpay_payment_id: "pay_1",
        razorpay_order_id: "order_server",
        razorpay_signature: "signed",
      });
    });
    expect(screen.getByRole("status")).toHaveTextContent(/confirming your place/i);

    await act(async () => {
      vi.advanceTimersByTime(2_000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("You're in.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /reserve my place/i })).not.toBeInTheDocument();
  });

  it("keeps retry blocked when confirmation takes longer than expected", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort });
      if (url === "/api/cohorts/cohort-1/checkout") {
        return response({
          key_id: "rzp_test_public",
          order_id: "order_server",
          amount: 2_100_000,
          currency: "INR",
          offer_id: "inr",
          cohort_title: cohort.title,
          email: "member@example.test",
        });
      }
      if (url === "/api/cohorts/cohort-1/checkout/verify") {
        return response({ verified: true, confirmed: false });
      }
      if (url === "/api/cohorts/my") return response({ enrollments: [] });
      throw new Error(`Unexpected request: ${url}`);
    }));
    render(<Pricing />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole("button", { name: /reserve my place/i }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const handler = mocks.razorpayOptions?.handler as (payload: unknown) => Promise<void>;
    await act(async () => {
      await handler({
        razorpay_payment_id: "pay_1",
        razorpay_order_id: "order_server",
        razorpay_signature: "signed",
      });
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000);
    });

    expect(screen.getByRole("status")).toHaveTextContent(/confirmation is taking longer/i);
    expect(screen.getByRole("status")).toHaveTextContent(/do not pay again/i);
    expect(screen.queryByRole("button", { name: /reserve my place/i })).not.toBeInTheDocument();
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
          offer_id: "inr",
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
        offer_id: "inr",
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

  it("recovers visibly when the checkout window never appears", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/cohorts/modern-caveman") return response({ cohort });
      return response({
        key_id: "rzp_test_public",
        order_id: "order_server",
        amount: 2_100_000,
        currency: "INR",
        offer_id: "inr",
        cohort_title: cohort.title,
        email: "member@example.test",
      });
    }));
    render(<Pricing />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole("button", { name: /reserve my place/i }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(mocks.open).toHaveBeenCalledOnce();

    await act(async () => {
      vi.advanceTimersByTime(3_000);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/payment window did not open/i);
    expect(screen.getByRole("alert")).toHaveTextContent(/you have not been charged/i);
    expect(screen.getByRole("button", { name: /reserve my place/i })).toBeEnabled();
  });

  it("does not report an error while the checkout window is present", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/cohorts/modern-caveman") return response({ cohort });
      return response({
        key_id: "rzp_test_public",
        order_id: "order_server",
        amount: 2_100_000,
        currency: "INR",
        offer_id: "inr",
        cohort_title: cohort.title,
        email: "member@example.test",
      });
    }));
    render(<Pricing />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole("button", { name: /reserve my place/i }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    const frame = document.createElement("iframe");
    frame.className = "razorpay-checkout-frame";
    document.body.appendChild(frame);

    await act(async () => {
      vi.advanceTimersByTime(3_000);
    });

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /preparing/i })).toBeDisabled();
  });

  it("ignores a hidden checkout element left behind by an earlier attempt", async () => {
    vi.useFakeTimers();
    const staleContainer = document.createElement("div");
    staleContainer.className = "razorpay-container";
    staleContainer.style.display = "none";
    document.body.appendChild(staleContainer);
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/cohorts/modern-caveman") return response({ cohort });
      return response({
        key_id: "rzp_test_public",
        order_id: "order_server",
        amount: 2_100_000,
        currency: "INR",
        offer_id: "inr",
        cohort_title: cohort.title,
        email: "member@example.test",
      });
    }));
    render(<Pricing />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    fireEvent.click(screen.getByRole("button", { name: /reserve my place/i }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    await act(async () => {
      vi.advanceTimersByTime(3_000);
    });

    expect(screen.getByRole("alert")).toHaveTextContent(/payment window did not open/i);
    expect(screen.getByRole("button", { name: /reserve my place/i })).toBeEnabled();
  });

  it("explains a provider configuration outage without calling it a payment failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/cohorts/modern-caveman") return response({ cohort });
      return new Response(
        JSON.stringify({ detail: { code: "checkout_temporarily_unavailable" } }),
        {
          status: 503,
          headers: {
            "content-type": "application/json",
            "x-correlation-id": "11111111-1111-4111-8111-111111111111",
          },
        },
      );
    }));
    render(<Pricing />);

    fireEvent.click(await screen.findByRole("button", { name: /reserve my place/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /secure checkout is temporarily unavailable/i,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/you have not been charged/i);
    expect(screen.getByRole("alert")).toHaveTextContent(/reference: 11111111/i);
    expect(screen.queryByText(/payment failed/i)).not.toBeInTheDocument();
    expect(mocks.open).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /reserve my place/i })).toBeEnabled();
  });

  it("prevents a blind retry when provider completion is uncertain", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/cohorts/modern-caveman") return response({ cohort });
      return response({ detail: { code: "checkout_reconciliation_required" } }, 502);
    }));
    render(<Pricing />);

    fireEvent.click(await screen.findByRole("button", { name: /reserve my place/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /may have reached the payment provider/i,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/contact support before trying again/i);
    expect(mocks.open).not.toHaveBeenCalled();
    expect(screen.getByRole("status")).toHaveTextContent(/do not pay again/i);
    expect(screen.queryByRole("button", { name: /reserve my place/i })).not.toBeInTheDocument();
  });

  it("restores unresolved checkout protection after a page reload", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort });
      if (url === "/api/cohorts/my") {
        return response({
          enrollments: [{ status: "checkout_unknown", cohort: { id: cohort.id } }],
        });
      }
      if (url.endsWith("/waitlist/status")) {
        return response({ status: "not_joined", can_checkout: false });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));

    render(<Pricing />);

    expect(await screen.findByRole("status")).toHaveTextContent(/checkout unresolved/i);
    expect(screen.getByRole("status")).toHaveTextContent(/do not pay again/i);
    expect(screen.queryByRole("button", { name: /reserve my place/i })).not.toBeInTheDocument();
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
          offer_id: "inr",
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

  it("restores confirmation protection after a page reload", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url === "/api/cohorts/modern-caveman") return response({ cohort });
      if (url === "/api/cohorts/my") {
        return response({
          enrollments: [{
            status: "pending_payment",
            payment_confirmation_pending: true,
            cohort: { id: cohort.id },
          }],
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    }));
    render(<Pricing />);

    expect(await screen.findByRole("status")).toHaveTextContent(/confirming your place/i);
    expect(screen.getByRole("status")).toHaveTextContent(/do not pay again/i);
    expect(screen.queryByRole("button", { name: /reserve my place/i })).not.toBeInTheDocument();
  });
});
