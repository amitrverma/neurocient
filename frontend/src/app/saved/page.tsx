"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, BookOpen, LoaderCircle, Lock } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "../components/AuthModal";

interface SavedArticle {
  slug: string;
  title?: string;
  excerpt?: string;
}

export default function SavedArticlesPage() {
  const { user, ready } = useAuth();
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!ready) return;

    if (!user) {
      setArticles([]);
      setLoadFailed(false);
      setLoading(false);
      return;
    }

    const fetchSaved = async () => {
      setLoading(true);
      setLoadFailed(false);
      try {
        const res = await fetch("/api/articles/saved", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to load saved articles: ${res.status}`);
        const data = await res.json();
        setArticles(data.saved || []);
      } catch (err) {
        console.error("Error loading saved articles:", err);
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [ready, user, reloadKey]);

  return (
    <main className="surface-page">
      <section className="surface-hero utility-hero">
        <div>
          <p className="surface-eyebrow">Reading shelf</p>
          <h1 className="surface-title">
            Saved
            <span>insights.</span>
          </h1>
        </div>

        <aside className="utility-hero-card">
          <p>{loadFailed ? "Shelf unavailable" : user ? `${articles.length} saved` : "Account required"}</p>
          <strong>Return to what mattered.</strong>
          <span>Keep the essays you want to revisit when a pattern shows up in work, relationships, stress, or decision making.</span>
        </aside>
      </section>

      <section className="px-6 pb-16 md:pb-20">
        <div className="mx-auto max-w-6xl">
          {!ready || loading ? (
            <StatePanel
              icon={<LoaderCircle className="h-6 w-6 animate-spin" />}
              label="Loading"
              title="Opening your saved shelf"
              text="Reading your account and saved articles."
            />
          ) : loadFailed ? (
            <StatePanel
              icon={<Bookmark className="h-6 w-6" />}
              label="Saved shelf unavailable"
              title="Your saved insights could not be loaded"
              text="Nothing has been counted as empty. Try again when the connection is available."
              action={
                <button
                  onClick={() => setReloadKey((value) => value + 1)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-brand-dark"
                >
                  Try again
                  <ArrowRight className="h-4 w-4" />
                </button>
              }
            />
          ) : !user ? (
            <StatePanel
              icon={<Lock className="h-6 w-6" />}
              label="Private shelf"
              title="Log in to view saved insights"
              text="Saved articles are tied to your account, so they stay available across devices."
              action={
                <button
                  onClick={() => setShowAuth(true)}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary"
                >
                  Log in
                  <ArrowRight className="h-4 w-4" />
                </button>
              }
            />
          ) : articles.length === 0 ? (
            <StatePanel
              icon={<BookOpen className="h-6 w-6" />}
              label="Empty shelf"
              title="No saved articles yet"
              text="Use the bookmark button inside any insight to collect essays worth revisiting."
              action={
                <Link
                  href="/insights"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-dark px-5 py-2.5 font-sans text-sm font-semibold text-white transition hover:bg-brand-primary"
                >
                  Browse insights
                  <ArrowRight className="h-4 w-4" />
                </Link>
              }
            />
          ) : (
            <div className="border-y border-brand-dark/14">
              {articles.map((article) => (
                <SavedArticleRow key={article.slug} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </main>
  );
}

const StatePanel = ({
  icon,
  label,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) => (
  <div className="rounded-lg border border-brand-dark/12 bg-white p-8 shadow-sm md:p-10">
    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-teal/35 text-brand-accent">
      {icon}
    </span>
    <p className="mt-5 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
      {label}
    </p>
    <h2 className="mt-2 text-3xl font-bold leading-tight">{title}</h2>
    <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-brand-dark/72">
      {text}
    </p>
    {action && <div className="mt-6">{action}</div>}
  </div>
);

const SavedArticleRow = ({ article }: { article: SavedArticle }) => (
  <article className="group border-b border-brand-dark/12 py-7 last:border-b-0 md:py-8">
    <Link href={`/insights/${article.slug}`}>
      <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-[-0.02em] transition group-hover:text-brand-primary md:text-4xl">
        {article.title || article.slug}
      </h2>
    </Link>
    {article.excerpt && (
      <p className="mt-4 max-w-3xl font-sans text-sm leading-7 text-brand-dark/72 md:text-base md:leading-8">
        {article.excerpt}
      </p>
    )}
    <Link
      href={`/insights/${article.slug}`}
      className="mt-5 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brand-accent"
    >
      Read article
      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    </Link>
  </article>
);
