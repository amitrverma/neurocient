"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BookOpen, Mail, UserRound } from "lucide-react";
import { AdminPageIntro, AdminState, MetricCard } from "./_components/AdminPrimitives";
import { useAdminResource } from "./_lib/useAdminResource";

type Overview = {
  audience: { registered_users: number; newsletter_subscribers: number };
  access: { active_memberships: number; paid_program_enrollments: number };
  activity: { completed_scans: number; spots: number; active_practices: number; active_microchallenges: number; saved_insights: number; weekly_reflections: number };
  delivery: { push_users: number; verified_whatsapp_users: number };
  content: { articles: number; active_nudges: number; microchallenges: number };
};

export default function AdminPage() {
  const { data, loading, error, retry } = useAdminResource<Overview>("/api/admin/overview");
  return (
    <section className="mx-auto max-w-6xl px-5 py-10 md:py-12">
      <AdminPageIntro eyebrow="Operations" title="Admin overview" description="A current view of accounts, communications, access, participation, delivery, and content already recorded by Neurocient." />
      <AdminState loading={loading} error={error} onRetry={retry}>
        {data ? <div className="mt-8 grid gap-10">
          <MetricSection title="Accounts and communications" metrics={[["Registered accounts", data.audience.registered_users], ["Newsletter subscribers", data.audience.newsletter_subscribers]]} />
          <MetricSection title="Access and programs" metrics={[["Active memberships", data.access.active_memberships], ["Paid enrollments", data.access.paid_program_enrollments]]} />
          <MetricSection title="Product activity" metrics={[["Completed scans", data.activity.completed_scans], ["Spots", data.activity.spots], ["Active Practices", data.activity.active_practices], ["Active microchallenges", data.activity.active_microchallenges], ["Saved insights", data.activity.saved_insights], ["Weekly reflections", data.activity.weekly_reflections]]} />
          <MetricSection title="Reach and content" metrics={[["Push-enabled users", data.delivery.push_users], ["Verified WhatsApp", data.delivery.verified_whatsapp_users], ["Tracked articles", data.content.articles], ["Active nudges", data.content.active_nudges], ["Microchallenges", data.content.microchallenges]]} />
        </div> : null}
      </AdminState>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        <QuickLink href="/admin/users" icon={<UserRound />} title="Accounts" text="Registered accounts, access status, delivery readiness, and activity counts." />
        <QuickLink href="/admin/newsletter" icon={<Mail />} title="Communications" text="Newsletter subscribers and signup dates." />
        <QuickLink href="/admin/content" icon={<BookOpen />} title="Content" text="Article reads, saves, and the current nudge inventory." />
      </div>
    </section>
  );
}

const MetricSection = ({ title, metrics }: { title: string; metrics: Array<[string, number]> }) => {
  const id = `metric-${title.replaceAll(" ", "-").toLowerCase()}`;
  return <section aria-labelledby={id}><h2 id={id} className="text-2xl font-bold">{title}</h2><div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{metrics.map(([label, value]) => <MetricCard key={label} label={label} value={value} />)}</div></section>;
};

const QuickLink = ({ href, icon, title, text }: { href: string; icon: ReactNode; title: string; text: string }) => (
  <Link href={href} className="group rounded-xl border border-brand-dark/10 bg-white p-6 shadow-sm"><span className="text-brand-accent [&>svg]:h-6 [&>svg]:w-6">{icon}</span><h2 className="mt-5 text-2xl font-bold">{title}</h2><p className="mt-2 font-sans text-sm leading-6 text-brand-dark/65">{text}</p><ArrowRight className="mt-6 h-5 w-5 transition group-hover:translate-x-1" /></Link>
);
