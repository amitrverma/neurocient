"use client";

import {
  Mail,
  Phone,
  Send,
  User,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
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
      return; // IMPORTANT
    }

    toast.success("Message delivered — I’ll get back to you soon!");
    formEl.reset(); // clear form

  } catch (err) {
    toast.error("Could not send message. Try again?");
  } finally {
    setSubmitting(false);
  }
}


  return (
    <main className="flex flex-col px-6 py-20 font-serif bg-white">
      <div className="max-w-4xl mx-auto space-y-20">
        {/* ----------------
            HERO
        ---------------- */}
        <section className="text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-brand-dark leading-tight">
            Get in Touch
          </h1>

          <p className="text-lg md:text-xl text-brand-dark/70 max-w-2xl mx-auto leading-relaxed">
            Whether you’re curious about programs, collaborations, or leadership
            sessions — I’d love to hear from you.
          </p>
        </section>

        {/* ----------------
            CONTACT OPTIONS
        ---------------- */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Email */}
          <a
            href="mailto:hello@neurocient.com"
            className="border rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-brand-primary" />
              <h3 className="text-xl font-semibold text-brand-dark">Email</h3>
            </div>

            <p className="text-brand-dark/70">hello@neurocient.com</p>
            <span className="text-brand-primary text-sm font-semibold flex items-center gap-1 mt-2">
              Send an email <ChevronRight className="w-4 h-4" />
            </span>
          </a>

          {/* Phone */}
          <a
            href="tel:+918551915656"
            className="border rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6 text-brand-teal" />
              <h3 className="text-xl font-semibold text-brand-dark">
                Phone / WhatsApp
              </h3>
            </div>

            <p className="text-brand-dark/70">+91-85519 15656</p>
            <span className="text-brand-teal text-sm font-semibold flex items-center gap-1 mt-2">
              Call or message <ChevronRight className="w-4 h-4" />
            </span>
          </a>
        </section>

        {/* ----------------
            CONTACT FORM
        ---------------- */}
        <section className="border rounded-xl shadow-md p-8 bg-white">
          <h2 className="text-2xl font-bold text-brand-dark mb-6">
            Send a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">
                Your Name
              </label>

              <div className="flex items-center border rounded-lg p-3 gap-3">
                <User className="w-5 h-5 text-brand-accent" />
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full outline-none text-brand-dark"
                  placeholder="Your Name"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">
                Email Address
              </label>

              <div className="flex items-center border rounded-lg p-3 gap-3">
                <Mail className="w-5 h-5 text-brand-primary" />
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full outline-none text-brand-dark"
                  placeholder="you@domain.com"
                />
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-brand-dark mb-1">
                Message
              </label>

              <div className="flex items-start border rounded-lg p-3 gap-3">
                <MessageSquare className="w-5 h-5 text-brand-teal mt-1" />
                <textarea
                  name="message"
                  required
                  rows={5}
                  className="w-full outline-none resize-none text-brand-dark"
                  placeholder="Tell me a little about what you're looking for…"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full md:w-auto px-6 py-3 rounded-full border text-brand-dark font-semibold flex items-center gap-2 transition
              ${
                submitting
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-brand-primary hover:text-white"
              }`}
            >
              {submitting ? "Sending…" : "Send Message"}
              <Send className="w-5 h-5" />
            </button>
          </form>
        </section>

        {/* ----------------
            ADDRESS (optional)
        ---------------- */}
        <section className="text-center space-y-2 text-sm text-brand-dark/60">
          Neurocient • Pune, India
        </section>
      </div>
    </main>
  );
}
