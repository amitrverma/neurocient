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

  it("replaces checkout with a meaningful active-membership arrival state", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => response({
      is_active: true,
      status: "active",
      current_period_end: "2026-11-30T18:30:00",
      checkout_configured: true,
      checkout_state: "ready",
    })));

    render(<MembershipCheckout />);

    expect(await screen.findByRole("status")).toHaveTextContent("Welcome to Neurocient");
    expect(screen.getByText(/full access to insights, practice, spots and microchallenges/i)).toBeInTheDocument();
    expect(screen.getByText(/access confirmed through 30 november 2026/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /begin with practice/i })).toHaveAttribute("href", "/practice");
    expect(screen.getByRole("link", { name: /explore insights/i })).toHaveAttribute("href", "/insights");
    expect(screen.queryByRole("button", { name: /join for/i })).not.toBeInTheDocument();
  });

  it("requests cancellation only after confirmation and keeps paid access visible", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input) === "/api/membership/status") {
        return response({
          is_active: true,
          status: "active",
          current_period_end: "2026-11-30T18:30:00",
          checkout_configured: true,
        });
      }
      if (String(input) === "/api/membership/cancel" && init?.method === "POST") {
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
    expect(screen.getByText(/access remains active through 30 november 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome to neurocient/i)).toBeInTheDocument();
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

    expect(await screen.findByText(/needs confirmation from razorpay/i)).toBeInTheDocument();
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
