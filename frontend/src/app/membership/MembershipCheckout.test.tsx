import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: { id: "user-1", email: "member@example.test" } as { id: string; email: string } | null,
  razorpayOptions: null as Record<string, unknown> | null,
  open: vi.fn(),
}));

vi.mock("@/app/context/AuthContext", () => ({
  useAuth: () => ({ user: mocks.user, ready: true }),
}));
vi.mock("@/app/components/AuthModal", () => ({
  default: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div role="dialog">Sign in</div> : null,
}));
import MembershipCheckout from "./MembershipCheckout";

const response = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

describe("membership checkout", () => {
  beforeEach(() => {
    mocks.user = { id: "user-1", email: "member@example.test" };
    mocks.razorpayOptions = null;
    mocks.open.mockReset();
    window.Razorpay = function Razorpay(options: Record<string, unknown>) {
      mocks.razorpayOptions = options;
      return { open: mocks.open };
    } as typeof window.Razorpay;
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    delete window.Razorpay;
    document.querySelectorAll('script[data-neurocient-razorpay="true"]').forEach((script) => script.remove());
  });

  it("requires sign-in before creating a subscription", async () => {
    mocks.user = null;
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<MembershipCheckout />);

    fireEvent.click(screen.getByRole("button", { name: "Log in to join" }));

    expect(screen.getByRole("dialog", { name: "" })).toHaveTextContent("Sign in");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("opens the server-created subscription and treats the callback as pending only", async () => {
    let statusReads = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/membership/status") {
        statusReads += 1;
        return response({
          is_active: statusReads > 1,
          checkout_configured: true,
          checkout_state: "ready",
        });
      }
      if (url === "/api/membership/checkout" && init?.method === "POST") {
        return response({
          key_id: "rzp_test_public",
          subscription_id: "sub_server_created",
          offer_id: "inr",
          amount: 49_900,
          currency: "INR",
          name: "Neurocient Membership",
          description: "₹499 per month",
          email: "member@example.test",
        });
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<MembershipCheckout />);

    const button = await screen.findByRole("button", { name: "Join for ₹499/month" });
    fireEvent.click(button);
    await waitFor(() => expect(mocks.open).toHaveBeenCalledOnce());
    expect(mocks.razorpayOptions?.subscription_id).toBe("sub_server_created");

    const handler = mocks.razorpayOptions?.handler as () => void;
    handler();
    expect(await screen.findByRole("status")).toHaveTextContent("Your membership is active.");
    expect(fetchMock.mock.calls.filter(([url]) => String(url) === "/api/membership/checkout")).toHaveLength(1);
  });

  it("opens the server-created Razorpay USD subscription separately", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) === "/api/membership/status") {
        return response({
          is_active: false,
          checkout_configured: true,
          checkout_offers: [
            { offer_id: "inr", amount_minor: 49_900, currency: "INR", display_price: "₹499/month", configured: true },
            { offer_id: "usd", amount_minor: 600, currency: "USD", display_price: "US$6/month", configured: true },
          ],
        });
      }
      if (String(input) === "/api/membership/checkout" && init?.method === "POST") {
        return response({
          key_id: "rzp_test_public",
          subscription_id: "sub_usd_server_created",
          offer_id: "usd",
          amount: 600,
          currency: "USD",
          name: "Neurocient Membership",
          description: "US$6 per month",
          email: "member@example.test",
        });
      }
      throw new Error(`Unexpected request: ${String(input)}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<MembershipCheckout />);

    const usdButton = await screen.findByRole("button", { name: "Join for US$6/month" });
    fireEvent.click(usdButton);

    await waitFor(() => expect(mocks.open).toHaveBeenCalledOnce());
    expect(mocks.razorpayOptions?.subscription_id).toBe("sub_usd_server_created");
    const checkoutCall = fetchMock.mock.calls.find(([url]) => String(url) === "/api/membership/checkout");
    expect(checkoutCall?.[1]).toMatchObject({
      method: "POST",
      body: JSON.stringify({ offer_id: "usd" }),
    });
  });

  it("refuses to open checkout when the server returns another currency", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) === "/api/membership/status") {
        return response({
          is_active: false,
          checkout_configured: true,
          checkout_offers: [
            { offer_id: "inr", amount: 49_900, currency: "INR", display_price: "â‚¹499/month", configured: true },
            { offer_id: "usd", amount: 600, currency: "USD", display_price: "US$6/month", configured: true },
          ],
        });
      }
      if (String(input) === "/api/membership/checkout" && init?.method === "POST") {
        return response({
          key_id: "rzp_test_public",
          subscription_id: "sub_wrong_currency",
          offer_id: "inr",
          amount: 49_900,
          currency: "INR",
        });
      }
      throw new Error(`Unexpected request: ${String(input)}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<MembershipCheckout />);

    fireEvent.click(await screen.findByRole("button", { name: "Join for US$6/month" }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Checkout did not match the currency you selected",
    );
    expect(mocks.open).not.toHaveBeenCalled();
  });

  it("replaces checkout with a meaningful active-membership arrival state", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => response({
      is_active: true,
      status: "active",
      current_period_end: "2026-11-30T18:30:00Z",
      access_ends_at: "2026-11-30T18:30:00Z",
      renewal_at: "2026-11-30T18:30:00Z",
      access_phase: "active",
      checkout_configured: true,
      checkout_state: "ready",
    })));

    render(<MembershipCheckout />);

    expect(await screen.findByRole("status")).toHaveTextContent("Welcome to Neurocient");
    expect(screen.getByText(/full access to insights, practice, spots and microchallenges/i)).toBeInTheDocument();
    expect(screen.getByText(/renews on 1 december 2026/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /begin with practice/i })).toHaveAttribute("href", "/practice");
    expect(screen.getByRole("link", { name: /explore insights/i })).toHaveAttribute("href", "/insights");
    expect(screen.queryByRole("button", { name: /join for/i })).not.toBeInTheDocument();
  });

  it("shows renewal recovery with the authoritative access deadline", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => response({
      is_active: true,
      status: "past_due",
      access_phase: "payment_retrying",
      current_period_end: "2026-11-10T12:00:00Z",
      access_ends_at: "2026-11-13T12:00:00Z",
      grace_period_end: "2026-11-13T12:00:00Z",
      checkout_configured: true,
    })));

    render(<MembershipCheckout />);

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(/payment retry in progress/i);
    expect(status).toHaveTextContent(/access continues through 13 november 2026/i);
    expect(screen.queryByRole("button", { name: /join for/i })).not.toBeInTheDocument();
  });

  it("shows the three-day grace state without offering a duplicate subscription", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => response({
      is_active: true,
      status: "past_due",
      access_phase: "grace_period",
      current_period_end: "2026-11-10T12:00:00Z",
      access_ends_at: "2026-11-13T12:00:00Z",
      grace_period_end: "2026-11-13T12:00:00Z",
      checkout_configured: true,
    })));

    render(<MembershipCheckout />);

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent(/three-day grace period/i);
    expect(status).toHaveTextContent(/access continues through 13 november 2026/i);
    expect(screen.queryByRole("button", { name: /join for/i })).not.toBeInTheDocument();
  });

  it("persists an uncertain checkout state across reload and blocks repayment", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => response({
      is_active: false,
      status: "inactive",
      access_phase: "inactive",
      checkout_state: "unknown",
      checkout_configured: true,
    })));

    render(<MembershipCheckout />);

    expect(await screen.findByRole("status")).toHaveTextContent(
      /previous checkout needs confirmation/i,
    );
    expect(screen.getAllByRole("button", { name: /join for/i })).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ disabled: true }),
        expect.objectContaining({ disabled: true }),
      ]),
    );
  });

  it("requests cancellation only after confirmation and keeps paid access visible", async () => {
    let canceled = false;
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) === "/api/membership/status") {
        return response({
          is_active: true,
          status: "active",
          current_period_end: "2026-11-30T18:30:00",
          access_ends_at: "2026-11-30T18:30:00",
          renewal_at: canceled ? null : "2026-11-30T18:30:00",
          cancellation_effective_at: canceled ? "2026-11-30T18:30:00" : null,
          access_phase: canceled ? "cancellation_scheduled" : "active",
          cancellation_state: canceled ? "requested" : null,
          checkout_configured: true,
        });
      }
      if (String(input) === "/api/membership/cancel" && init?.method === "POST") {
        canceled = true;
        return response({ status: "requested", effective_at: "2026-11-30T18:30:00" }, 202);
      }
      throw new Error(`Unexpected request: ${String(input)}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<MembershipCheckout />);

    fireEvent.click(await screen.findByRole("button", { name: /cancel membership/i }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /confirm cancellation/i }));

    expect(await screen.findByText(/cancellation is scheduled/i)).toBeInTheDocument();
    expect(screen.getByText(/access remains active through 1 december 2026/i)).toBeInTheDocument();
    expect(screen.getByRole("status")).not.toHaveTextContent(/renews on/i);
  });

  it("reports uncertain cancellation without pretending access changed", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/membership/status") {
        return response({ is_active: true, status: "active", checkout_configured: true });
      }
      return response(
        { detail: { code: "cancellation_reconciliation_required" } },
        502,
      );
    }));
    render(<MembershipCheckout />);

    fireEvent.click(await screen.findByRole("button", { name: /cancel membership/i }));
    fireEvent.click(screen.getByRole("button", { name: /confirm cancellation/i }));

    expect(await screen.findByText(/needs confirmation from the payment provider/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome to neurocient/i)).toBeInTheDocument();
  });

  it("blocks retry messaging when creation needs reconciliation", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/membership/status") {
        return response({ is_active: false, checkout_configured: true, checkout_state: "unknown" });
      }
      return response({ detail: { code: "reconciliation_required" } }, 409);
    }));
    render(<MembershipCheckout />);
    fireEvent.click(await screen.findByRole("button", { name: "Join for ₹499/month" }));
    expect(await screen.findByText(/previous checkout needs confirmation/i)).toBeInTheDocument();
  });

  it("recovers when checkout transport fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/membership/status") {
        return response({ is_active: false, checkout_configured: true });
      }
      throw new Error("network offline");
    }));
    render(<MembershipCheckout />);

    fireEvent.click(await screen.findByRole("button", { name: "Join for ₹499/month" }));

    expect(await screen.findByText(/temporarily unavailable/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join for ₹499/month" })).toBeEnabled();
  });

  it("removes a failed Razorpay script so retry can load it again", async () => {
    delete window.Razorpay;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/membership/status") {
        return response({ is_active: false, checkout_configured: true });
      }
      return response({
        key_id: "rzp_test_public",
        subscription_id: "sub_retry_script",
        offer_id: "inr",
        amount: 49_900,
        currency: "INR",
        name: "Neurocient Membership",
        description: "₹499 per month",
        email: "member@example.test",
      });
    }));
    render(<MembershipCheckout />);
    const button = await screen.findByRole("button", { name: "Join for ₹499/month" });

    fireEvent.click(button);
    const first = await waitFor(() => {
      const script = document.querySelector<HTMLScriptElement>('script[data-neurocient-razorpay="true"]');
      expect(script).not.toBeNull();
      return script!;
    });
    fireEvent.error(first);
    expect(await screen.findByText(/could not be loaded/i)).toBeInTheDocument();
    expect(document.querySelector('script[data-neurocient-razorpay="true"]')).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Join for ₹499/month" }));
    await waitFor(() => {
      const second = document.querySelector('script[data-neurocient-razorpay="true"]');
      expect(second).not.toBeNull();
      expect(second).not.toBe(first);
    });
  });

  it("recovers when post-payment confirmation cannot be checked", async () => {
    let statusReads = 0;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      if (String(input) === "/api/membership/status") {
        statusReads += 1;
        if (statusReads > 1) throw new Error("status offline");
        return response({ is_active: false, checkout_configured: true });
      }
      return response({
        key_id: "rzp_test_public",
        subscription_id: "sub_confirmation_network",
        offer_id: "inr",
        amount: 49_900,
        currency: "INR",
        name: "Neurocient Membership",
        description: "₹499 per month",
        email: "member@example.test",
      });
    }));
    render(<MembershipCheckout />);
    fireEvent.click(await screen.findByRole("button", { name: "Join for ₹499/month" }));
    await waitFor(() => expect(mocks.open).toHaveBeenCalledOnce());

    const handler = mocks.razorpayOptions?.handler as () => void;
    handler();

    expect(await screen.findByText(/confirmation could not be checked/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Join for ₹499/month" })).toBeEnabled();
  });
});
