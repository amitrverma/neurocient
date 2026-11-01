"use client";

import { useState } from "react";
import {
  AdminPageIntro,
  AdminState,
  Pagination,
  StatusBadge,
} from "../_components/AdminPrimitives";
import { useAdminResource } from "../_lib/useAdminResource";

type Payment = {
  id: string;
  status: string;
  amount_minor: number;
  currency: string;
  provider_order_id: string;
  provider_payment_id?: string;
  email: string;
  cohort_title: string;
  created_at: string;
};
type PaymentResponse = {
  payments: Payment[];
  total: number;
  page: number;
  page_size: number;
};
type PaymentEvent = {
  id: string;
  event_type: string;
  status: string;
  payment_id?: string;
  order_id?: string;
  processed_at?: string;
  created_at: string;
};
type EventResponse = {
  events: PaymentEvent[];
  total: number;
  page: number;
  page_size: number;
};
type ReconciliationIssue = {
  id: string;
  product: string;
  issue_code: string;
  object_type: string;
  local_object_id: string;
  provider_object_id?: string | null;
  severity: string;
  status: string;
  details: Record<string, unknown>;
  first_seen_at: string;
  last_seen_at: string;
  correlation_id?: string | null;
};
type IssueResponse = {
  issues: ReconciliationIssue[];
  total: number;
  page: number;
  page_size: number;
};
type OperationsResponse = {
  status: string;
  generated_at: string;
  signals: Record<string, number>;
};

export default function PaymentsPage() {
  const [view, setView] = useState<"records" | "events" | "issues">("issues");
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:py-12">
      <AdminPageIntro
        eyebrow="Reconciliation"
        title="Payment operations"
        description="Provider records, webhook outcomes and observation-only reconciliation. Browser returns never change access or fulfilment."
      />
      <OperationsSummary />
      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Payment data view">
        {(["issues", "records", "events"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => setView(value)}
            className={`min-h-11 rounded-full px-4 font-sans text-sm font-semibold capitalize ${
              view === value
                ? "bg-brand-dark text-white"
                : "border border-brand-dark/15 bg-white"
            }`}
          >
            {value === "records"
              ? "Cohort records"
              : value === "events"
                ? "Webhook events"
                : "Open issues"}
          </button>
        ))}
      </div>
      {view === "records" ? (
        <PaymentRecords />
      ) : view === "events" ? (
        <PaymentEvents />
      ) : (
        <ReconciliationIssues />
      )}
    </section>
  );
}

function OperationsSummary() {
  const { data, loading, error, retry } =
    useAdminResource<OperationsResponse>("/api/admin/operations");
  return (
    <AdminState loading={loading} error={error} onRetry={retry}>
      {data ? (
        <div className="mt-7 rounded-xl border border-brand-dark/10 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-brand-dark/45">
                Operational state
              </p>
              <p className="mt-1 font-sans text-lg font-semibold capitalize">{data.status}</p>
            </div>
            <StatusBadge value={data.status} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(data.signals).map(([name, count]) => (
              <div key={name} className="rounded-lg bg-brand-light/45 p-3">
                <p className="font-sans text-2xl font-semibold">{count}</p>
                <p className="mt-1 font-sans text-xs text-brand-dark/55">
                  {name.replaceAll("_", " ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </AdminState>
  );
}

function ReconciliationIssues() {
  const [page, setPage] = useState(1);
  const { data, loading, error, retry } = useAdminResource<IssueResponse>(
    `/api/admin/reconciliation-issues?status=open&page=${page}&page_size=50`,
  );
  const issues = data?.issues || [];
  return (
    <AdminState
      loading={loading}
      error={error}
      empty={!loading && data && issues.length === 0 ? "No open reconciliation issues." : undefined}
      onRetry={retry}
    >
      {data ? (
        <>
          <p className="mt-7 font-sans text-sm text-brand-dark/55">
            {data.total.toLocaleString("en-IN")} open issues
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="grid gap-3 border-b border-brand-dark/10 p-5 last:border-0 md:grid-cols-[1fr_auto_auto] md:items-center"
              >
                <div>
                  <p className="font-sans text-sm font-semibold">
                    {issue.issue_code.replaceAll("_", " ")}
                  </p>
                  <p className="mt-1 font-sans text-xs text-brand-dark/55">
                    {issue.product} · {issue.object_type}
                  </p>
                  <p className="mt-1 break-all font-mono text-[11px] text-brand-dark/45">
                    Local {issue.local_object_id}
                    {issue.provider_object_id
                      ? ` · Provider ${issue.provider_object_id}`
                      : ""}
                  </p>
                  {issue.correlation_id ? (
                    <p className="mt-1 break-all font-mono text-[11px] text-brand-dark/45">
                      Correlation {issue.correlation_id}
                    </p>
                  ) : null}
                </div>
                <StatusBadge value={issue.severity} />
                <time className="font-sans text-xs text-brand-dark/50">
                  {new Date(issue.last_seen_at).toLocaleString("en-IN")}
                </time>
              </div>
            ))}
          </div>
          <Pagination
            page={data.page}
            pageSize={data.page_size}
            total={data.total}
            onPage={setPage}
          />
        </>
      ) : null}
    </AdminState>
  );
}

function PaymentRecords() {
  const [page, setPage] = useState(1);
  const { data, loading, error, retry } = useAdminResource<PaymentResponse>(
    `/api/admin/payments?page=${page}&page_size=50`,
  );
  const payments = data?.payments || [];
  return (
    <AdminState
      loading={loading}
      error={error}
      empty={!loading && data && payments.length === 0 ? "No payment records yet." : undefined}
      onRetry={retry}
    >
      {data ? (
        <>
          <p className="mt-7 font-sans text-sm text-brand-dark/55">
            {data.total.toLocaleString("en-IN")} payment records
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">
            {payments.map((payment) => (
              <div key={payment.id} className="grid gap-3 border-b border-brand-dark/10 p-5 last:border-0 md:grid-cols-[1fr_1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-sans text-sm font-semibold">{payment.email}</p>
                  <p className="font-sans text-xs text-brand-dark/55">{payment.cohort_title}</p>
                </div>
                <p className="break-all font-sans text-xs text-brand-dark/55">{payment.provider_payment_id || payment.provider_order_id}</p>
                <StatusBadge value={payment.status} />
                <span className="font-sans text-sm font-semibold">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: payment.currency }).format(payment.amount_minor / 100)}
                </span>
              </div>
            ))}
          </div>
          <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={setPage} />
        </>
      ) : null}
    </AdminState>
  );
}

function PaymentEvents() {
  const [page, setPage] = useState(1);
  const { data, loading, error, retry } = useAdminResource<EventResponse>(
    `/api/admin/payment-events?page=${page}&page_size=50`,
  );
  const events = data?.events || [];
  return (
    <AdminState
      loading={loading}
      error={error}
      empty={!loading && data && events.length === 0 ? "No webhook events yet." : undefined}
      onRetry={retry}
    >
      {data ? (
        <>
          <p className="mt-7 font-sans text-sm text-brand-dark/55">
            {data.total.toLocaleString("en-IN")} webhook events
          </p>
          <div className="mt-3 overflow-hidden rounded-xl border border-brand-dark/10 bg-white">
            {events.map((event) => (
              <div key={event.id} className="grid gap-3 border-b border-brand-dark/10 p-5 last:border-0 md:grid-cols-[1fr_1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-sans text-sm font-semibold">{event.event_type}</p>
                  <p className="mt-1 break-all font-sans text-xs text-brand-dark/50">{event.id}</p>
                </div>
                <p className="break-all font-sans text-xs text-brand-dark/55">{event.payment_id || event.order_id || "No provider object ID"}</p>
                <StatusBadge value={event.status} />
                <time className="font-sans text-xs text-brand-dark/50">{new Date(event.processed_at || event.created_at).toLocaleString("en-IN")}</time>
              </div>
            ))}
          </div>
          <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={setPage} />
        </>
      ) : null}
    </AdminState>
  );
}
