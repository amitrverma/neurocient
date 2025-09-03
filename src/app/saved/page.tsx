"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchSaved = async () => {
      try {
        const res = await fetch("/api/articles/saved", {
          method: "GET",
          credentials: "include", // 👈 send cookies
        });
        if (res.ok) {
          const data = await res.json();
          setArticles(data.saved);
        }
      } catch (err) {
        console.error("❌ Error loading saved:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, [user]); // ✅ depend on user, not token

  if (!user) {
    return (
      <div className="text-center mt-12">
        Please
        <button
          onClick={() => setShowAuth(true)}
          className="text-[#5eb1bf] font-semibold hover:underline ml-1"
        >
          log in
        </button>{" "}
        to view saved articles.
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
        />
      </div>
    );
  }

  if (loading) return <p className="text-center mt-12">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Your Saved Articles
      </h1>
      {articles.length === 0 ? (
        <p className="text-center text-brand-dark">
          You haven’t saved any articles yet.
        </p>
      ) : (
        <ul className="space-y-6">
          {articles.map((a) => (
            <li key={a.slug} className="border-b pb-4">
              <Link
                href={`/insights/${a.slug}`}
                className="text-xl font-semibold text-brand-teal hover:text-brand-primary"
              >
                {a.title || a.slug}
              </Link>
              {a.excerpt && (
                <p className="text-brand-dark text-sm mt-1">{a.excerpt}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
