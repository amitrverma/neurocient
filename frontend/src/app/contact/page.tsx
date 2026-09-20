"use client";

import { Mail, MessageSquare, Phone, Send, User } from "lucide-react";
import { useState } from "react";
import type React from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const payload = {
      name: form.get("name") as string,
      email: form.get("email") as string,
      message: form.get("message") as string,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error ?? "Something went wrong.");
        return;
      }

      toast.success("Message delivered. I will get back to you soon.");
      formEl.reset();
    } catch {
      toast.error("Could not send message. Try again?");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <SectionLabel>Contact</SectionLabel>
            <h1 className="mt-6 text-[clamp(2.55rem,5vw,5.2rem)] font-bold leading-[0.98] tracking-[-0.03em]">
              Tell me what
              <br />
              <span className="italic text-brand-accent">you are building.</span>
            </h1>
          </div>
          <p className="max-w-2xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark/72 md:text-lg">
            For programs, leadership sessions, workplace diagnostics,
            collaborations, or questions about Neurocient Labs.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16 md:pb-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.42fr_0.58fr]">
          <div className="space-y-4">
            <ContactCard
              icon={<Mail className="h-5 w-5" />}
              title="Email"
              text="hello@neurocient.com"
              href="mailto:hello@neurocient.com"
            />
            <ContactCard
              icon={<Phone className="h-5 w-5" />}
              title="Phone / WhatsApp"
              text="+91-85519 15656"
              href="tel:+918551915656"
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-brand-dark/12 bg-white p-6 shadow-[0_20px_60px_rgba(4,42,43,0.06)] md:p-8"
          >
            <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
              Send a message
            </p>
            <div className="mt-6 grid gap-5">
              <Field icon={<User className="h-5 w-5" />}>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full bg-transparent font-sans text-sm outline-none"
                  placeholder="Your name"
                />
              </Field>
              <Field icon={<Mail className="h-5 w-5" />}>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full bg-transparent font-sans text-sm outline-none"
                  placeholder="you@domain.com"
                />
              </Field>
              <Field icon={<MessageSquare className="h-5 w-5" />} alignTop>
                <textarea
                  name="message"
                  required
                  rows={6}
                  className="w-full resize-none bg-transparent font-sans text-sm outline-none"
                  placeholder="Tell me a little about what you are looking for."
                />
              </Field>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary disabled:pointer-events-none disabled:opacity-45"
            >
              {submitting ? "Sending" : "Send message"}
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
    <span>{children}</span>
    <span className="h-px flex-1 bg-brand-dark/15" />
  </div>
);

const ContactCard = ({
  icon,
  title,
  text,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href: string;
}) => (
  <a
    href={href}
    className="block rounded-lg border border-brand-dark/12 p-6 transition hover:border-brand-teal/60 hover:shadow-sm"
  >
    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
      {icon}
    </span>
    <h2 className="mt-4 text-2xl font-bold leading-tight">{title}</h2>
    <p className="mt-2 font-sans text-sm leading-7 text-brand-dark/72">{text}</p>
  </a>
);

const Field = ({
  icon,
  children,
  alignTop = false,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  alignTop?: boolean;
}) => (
  <div
    className={`flex gap-3 rounded-lg border border-brand-dark/14 px-4 py-3 transition focus-within:border-brand-teal ${
      alignTop ? "items-start" : "items-center"
    }`}
  >
    <span className={`text-brand-accent ${alignTop ? "mt-0.5" : ""}`}>{icon}</span>
    {children}
  </div>
);
