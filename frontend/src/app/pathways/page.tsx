"use client";

import { useEffect, useState } from "react";
import type React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronDown, FileText, Wrench } from "lucide-react";
import { pathways } from "@/content/pathways";

type Resource = { slug?: string; title: string; href?: string; order?: number };

const cleanText = (value = "") =>
  value
    .replaceAll("â€“", "-")
    .replaceAll("â€”", "-")
    .replaceAll("â€™", "'")
    .replaceAll("â€œ", '"')
    .replaceAll("â€", '"')
    .replaceAll("Â", "")
    .trim();

const PathwaysPage = () => {
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openParam = params.get("open");
    if (openParam && pathways[openParam as keyof typeof pathways]) {
      setOpen(openParam);
      return;
    }

    setOpen(Object.values(pathways)[0].id);
  }, []);

  return (
    <main className="bg-white font-serif text-brand-dark">
      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <SectionLabel>Guided paths</SectionLabel>
            <h1 className="mt-6 text-[clamp(2.55rem,5vw,5.2rem)] font-bold leading-[0.98] tracking-[-0.03em]">
              Less browsing.
              <br />
              <span className="italic text-brand-accent">More sequence.</span>
            </h1>
          </div>
          <p className="max-w-2xl border-l-4 border-brand-secondary pl-5 font-sans text-base leading-8 text-brand-dark/72 md:text-lg">
            Choose a pathway when you want a theme, a reading order, and a few
            practical next moves instead of a loose library.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16 md:pb-20">
        <div className="mx-auto max-w-6xl border-y border-brand-dark/12">
          {Object.values(pathways).map((pathway) => {
            const active = open === pathway.id;
            return (
              <article key={pathway.id} className="border-b border-brand-dark/12 last:border-b-0">
                <button
                  onClick={() => setOpen(active ? null : pathway.id)}
                  className="grid w-full cursor-pointer gap-5 py-7 text-left md:grid-cols-[0.38fr_1fr_auto] md:items-center"
                >
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-teal">
                    {pathway.id}
                  </p>
                  <div>
                    <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em]">
                      {cleanText(pathway.title)}
                    </h2>
                    <p className="mt-2 max-w-2xl font-sans text-sm leading-7 text-brand-dark/72">
                      {cleanText(pathway.description)}
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-brand-accent transition ${active ? "rotate-180" : ""}`}
                  />
                </button>

                {active && (
                  <div className="grid gap-6 pb-8 md:grid-cols-3">
                    <PathwayBlock
                      icon={<FileText className="h-5 w-5" />}
                      label="Articles"
                    >
                      {pathway.articles.map((article: Resource) => (
                        <LinkRow
                          key={article.slug}
                          href={`/insights/${article.slug}`}
                          title={cleanText(article.title)}
                        />
                      ))}
                    </PathwayBlock>

                    <PathwayBlock
                      icon={<BookOpen className="h-5 w-5" />}
                      label="Books and research"
                    >
                      {[...pathway.books, ...pathway.research].map((item) => (
                        <p key={item} className="font-sans text-sm leading-7 text-brand-dark/72">
                          {cleanText(item)}
                        </p>
                      ))}
                    </PathwayBlock>

                    <PathwayBlock
                      icon={<Wrench className="h-5 w-5" />}
                      label="Tools"
                    >
                      {pathway.tools.length ? (
                        pathway.tools.map((tool: Resource) => (
                          <LinkRow
                            key={tool.href}
                            href={tool.href || "/tools"}
                            title={cleanText(tool.title)}
                          />
                        ))
                      ) : (
                        <p className="font-sans text-sm leading-7 text-brand-dark/72">
                          Start with the readings, then return to tools when a
                          pattern is visible.
                        </p>
                      )}
                    </PathwayBlock>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-3 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-brand-teal">
    <span>{children}</span>
    <span className="h-px flex-1 bg-brand-dark/15" />
  </div>
);

const PathwayBlock = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-lg border border-brand-dark/12 p-5">
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
        {icon}
      </span>
      <p className="font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
        {label}
      </p>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const LinkRow = ({ href, title }: { href: string; title: string }) => (
  <Link
    href={href}
    className="group flex items-start justify-between gap-3 font-sans text-sm font-semibold leading-6 text-brand-dark transition hover:text-brand-primary"
  >
    <span>{title}</span>
    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-brand-accent transition group-hover:translate-x-0.5" />
  </Link>
);

export default PathwaysPage;
