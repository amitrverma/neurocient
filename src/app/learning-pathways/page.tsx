"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { pathways } from "@/content/pathways";

type Resource = { slug?: string; title: string; href?: string; order?: number };

const LearningPathwaysPage = () => {
  const searchParams = useSearchParams();
  const openParam = searchParams.get("open");

  const allowMultiple = false;

  const [open, setOpen] = useState<string | null>(null);
  const [openList, setOpenList] = useState<string[]>([]);

  // ✅ On mount, check if ?open=xyz matches a pathway
  useEffect(() => {
    if (openParam && pathways[openParam as keyof typeof pathways]) {
      setOpen(openParam);
      setOpenList([openParam]);
    } else {
      // default → first pathway open
      const first = Object.values(pathways)[0].id;
      setOpen(first);
      setOpenList([first]);
    }
  }, [openParam]);

  const togglePathway = (id: string) => {
    if (allowMultiple) {
      setOpenList((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setOpen(open === id ? null : id);
    }
  };

  const isOpen = (id: string) => {
    return allowMultiple ? openList.includes(id) : open === id;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-14">
        <h1 className="text-5xl font-extrabold tracking-tight text-brand-dark mb-4">
          Learning Pathways
        </h1>
        <p className="text-lg text-brand-dark max-w-2xl mx-auto leading-relaxed">
          Unsure where to begin? Explore curated pathways to understand and
          outsmart your Inner Caveman. Each pathway is a map of articles, books,
          research, and tools that build depth around a central theme.
        </p>
      </div>

      {/* Accordion */}
      <div className="space-y-6">
        {Object.values(pathways).map((pathway) => {
          const active = isOpen(pathway.id);
          return (
            <div
              key={pathway.id}
              className={`rounded-xl border shadow-sm transition ${
                active
                  ? "border-brand-primary shadow-md"
                  : "border-brand-dark dark:border-brand-dark hover:shadow-md"
              } bg-transparent`}
            >
              <button
                onClick={() => togglePathway(pathway.id)}
                className="w-full flex justify-between items-center px-6 py-4 text-left"
              >
                <h2
                  className={`text-xl font-semibold ${
                    active ? "text-brand-primary" : "text-brand-dark"
                  }`}
                >
                  {pathway.title}
                </h2>
                <span
                  className={`text-2xl font-bold ${
                    active ? "text-brand-primary" : "text-brand-dark"
                  }`}
                >
                  {active ? "−" : "+"}
                </span>
              </button>

              {active && (
                <div className="px-6 pb-6 space-y-8 animate-fadeIn">
                  {pathway.articles?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-brand-primary mb-2">
                        Articles
                      </h3>
                      <div className="space-y-2 text-base text-brand-dark">
                        {pathway.articles.map((a: Resource) =>
                          a.slug ? (
                            <Link
                              key={a.slug}
                              href={`/insights/${a.slug}`}
                              className="block hover:underline"
                            >
                              {a.title}
                            </Link>
                          ) : (
                            <p key={a.title}>{a.title}</p>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {pathway.books?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-brand-secondary mb-2">
                        Books
                      </h3>
                      <div className="space-y-2 text-base text-brand-dark">
                        {pathway.books.map((b: string, i: number) => (
                          <p key={i}>{b}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {pathway.research?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-brand-tertiary mb-2">
                        Research
                      </h3>
                      <div className="space-y-2 text-base text-brand-dark">
                        {pathway.research.map((r: string, i: number) => (
                          <p key={i}>{r}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  {pathway.tools?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-brand-accent mb-2">
                        Tools
                      </h3>
                      <div className="space-y-2 text-base text-brand-dark">
                        {pathway.tools.map((t: Resource, i: number) =>
                          t.href ? (
                            <Link
                              key={i}
                              href={t.href}
                              className="block hover:underline"
                            >
                              {t.title}
                            </Link>
                          ) : (
                            <p key={i}>{t.title}</p>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPathwaysPage;
