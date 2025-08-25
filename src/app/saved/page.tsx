"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

interface SavedArticle {
  slug: string;
  title?: string;
  excerpt?: string;
}

export default function SavedArticlesPage() {
  const { token } = useAuth();
  const [articles, setArticles] = useState<SavedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchSaved = async () => {
      try {
        const res = await fetch("/api/articles/saved", {
          headers: { Authorization: `Bearer ${token}` },
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
  }, [token]);

  if (!token) {
    return <p className="text-center mt-12">Please log in to view saved articles.</p>;
  }

  if (loading) return <p className="text-center mt-12">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Saved Articles</h1>
      {articles.length === 0 ? (
        <p className="text-center text-gray-500">You haven’t saved any articles yet.</p>
      ) : (
        <ul className="space-y-6">
          {articles.map((a) => (
            <li key={a.slug} className="border-b pb-4">
              <Link href={`/insights/${a.slug}`} className="text-xl font-semibold text-brand-teal hover:text-brand-primary">
                {a.title || a.slug}
              </Link>
              {a.excerpt && <p className="text-gray-600 text-sm mt-1">{a.excerpt}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
