"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Twitter, Linkedin, Mail } from "lucide-react";
import ScrollProgress from "./ui/ScrollProgress";
import FurtherReads from "./FurtherReads";
import type { PathwayId, ArticleRef } from "@/content/pathways";
import Newsletter from "./Newsletter";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "./AuthModal";
import { useNotification } from "./NotificationProvider";
import { incrementUsage } from "../utils/usage";
import MembershipModal from "./MembershipModal";

interface ResourceItem {
  title: string;
  href?: string;
}

interface ArticleResources {
  books?: string[];
  research?: string[];
  internal?: ResourceItem[];
}

interface ArticleLayoutProps {
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
  readingTime?: string;
  slug?: string;
  children: ReactNode;
  nextArticle?: { slug: string; title: string; excerpt?: string } | null;
  resources?: ArticleResources;
  pathway?: { id: PathwayId; title: string } | null;
  prevInPath?: ArticleRef | null;
  nextInPath?: ArticleRef | null;
  spotPrompt: string | null;
}

const ArticleLayout = ({
  title,
  date,
  excerpt,
  tags = [],
  readingTime,
  slug,
  children,
  nextArticle,
  resources,
  pathway,
  prevInPath,
  nextInPath,
  spotPrompt, // eslint-disable-line @typescript-eslint/no-unused-vars
}: ArticleLayoutProps) => {
  const baseUrl = "https://amitrverma.com/insights";
  const articleUrl = slug ? `${baseUrl}/${slug}` : baseUrl;

  const { token } = useAuth();
  const { notify } = useNotification();
  const [showResources, setShowResources] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showMembership, setShowMembership] = useState(false);
  const nextRef = useRef<HTMLDivElement | null>(null);

  // ✅ Detect if article is already saved when component mounts
  useEffect(() => {
    if (!token || !slug) return;
    const checkSaved = async () => {
      try {
        const res = await fetch(`/api/articles/saved/${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setIsSaved(data.isSaved);
        }
      } catch (err) {
        console.error("❌ Error checking saved:", err);
      }
    };
    checkSaved();
  }, [slug, token]);

  // ✅ IntersectionObserver for sidebar
  useEffect(() => {
    if (!nextRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setShowResources(entry.isIntersecting));
      },
      { threshold: 0.3 }
    );
    observer.observe(nextRef.current);
    return () => observer.disconnect();
  }, []);

  // ✅ Mark as read when scrolled/time passed
  useEffect(() => {
    if (!slug) return;

    let incremented = false; // ensure one increment per article

    const markAsRead = async () => {
      if (incremented) return;
      incremented = true;

      console.log("📖 Marking article as read");
      const { allowed, count } = incrementUsage("articles", !!token);
      console.log("Usage updated:", { count, allowed });

      if (!allowed) {
        if (token) setShowMembership(true);
        else setShowAuth(true);
      }

      // 🔥 call backend to increment read count
      try {
        await fetch(`/api/articles/${slug}/read`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      } catch (err) {
        console.error("❌ Error incrementing read count:", err);
      }

      window.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };

    const onScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const scrolled = (scrollTop + windowHeight) / docHeight;
      if (scrolled >= 0.3) markAsRead();
    };

    const timeout = setTimeout(markAsRead, 15000);
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, [slug, token]);

  // ✅ Save / Unsave toggle
  const handleSave = async () => {
    if (!slug) return;

    if (!token) {
      setShowAuth(true);
      return;
    }

    try {
      const res = await fetch(`/api/articles/save/${slug}`, {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setIsSaved(!isSaved);
      } else {
        const data = await res.json();
        console.error("❌ Failed to save/unsave:", data);
        notify(data.detail || "Something went wrong", "error");
      }
    } catch (err) {
      console.error("❌ Error saving article:", err);
    }
  };

  return (
    <div className="relative">
      {/* 🔝 Sticky scroll progress under navbar */}
      <div className="sticky top-16 z-50 w-full bg-white dark:bg-brand-dark">
        <ScrollProgress />
      </div>

      <article className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Floating share + actions (desktop only) */}
        <div className="hidden lg:flex flex-col gap-4 absolute -left-16 top-20">
          {/* Share */}
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              articleUrl
            )}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Twitter size={20} className="text-brand-dark hover:text-brand-primary" />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              articleUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Linkedin size={20} className="text-brand-dark hover:text-brand-primary" />
          </a>
          <a href={`mailto:?subject=${title}&body=${articleUrl}`}>
            <Mail size={20} className="text-brand-dark hover:text-brand-primary" />
          </a>

          {/* Save */}
          <button
            onClick={handleSave}
            className={`transition ${
              isSaved ? "text-brand-primary" : "text-brand-dark hover:text-brand-primary"
            }`}
            title={isSaved ? "Remove from saved" : "Save for later"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill={isSaved ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z"
              />
            </svg>
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="text-brand-dark hover:text-brand-primary transition"
            title="Print this article"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 9V2h12v7M6 18h12v4H6v-4zM6 14h12"
              />
            </svg>
          </button>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs uppercase tracking-wide font-semibold">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="px-2 py-0.5 rounded bg-brand-secondary/20 text-brand-dark hover:bg-brand-secondary hover:text-brand-dark transition"
            >
              {tag}
            </Link>
          ))}
          {readingTime && <span className="text-brand-dark">{readingTime}</span>}
        </div>

        {/* Title */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-4xl font-bold tracking-tight text-brand-dark">
            {title}
          </h1>
        </div>

        {/* Date */}
        <p className="text-sm text-brand-dark mb-6">{date}</p>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-lg text-brand-dark mb-8 italic">{excerpt}</p>
        )}

        {/* MDX content */}
        <div className="prose prose-article text-[18px]">{children}</div>
        <div className="mt-12">
          <Newsletter
            subtext="Enjoyed this? Get one fresh insight each week straight to your inbox."
            logoSrc="/logo/newsletter.png"
          />
        </div>

        {/* Pathway navigation */}
        {pathway && (
          <div className="mt-16 border-t pt-8 text-sm text-brand-dark">
            <p>
              This article is part of the{" "}
              <Link
                href={`/learning-pathways?open=${pathway.id}`}
                className="text-brand-primary hover:underline"
              >
                {pathway.title}
              </Link>{" "}
              Pathway.
            </p>
            <div className="flex justify-between mt-3">
              {prevInPath ? (
                <Link
                  href={`/insights/${prevInPath.slug}`}
                  className="hover:underline"
                >
                  ← {prevInPath.title}
                </Link>
              ) : (
                <span />
              )}
              {nextInPath ? (
                <Link
                  href={`/insights/${nextInPath.slug}`}
                  className="hover:underline"
                >
                  {nextInPath.title} →
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        )}

        {/* Random Read Next */}
        {nextArticle && (
          <div ref={nextRef} className="mt-16 border-t pt-8">
            <p className="text-sm text-brand-dark mb-2">You might also like:</p>
            <Link
              href={`/insights/${nextArticle.slug}`}
              className="text-xl font-semibold text-brand-teal hover:text-brand-primary transition"
            >
              {nextArticle.title}
            </Link>
            {nextArticle.excerpt && (
              <p className="text-brand-dark text-sm mt-1">{nextArticle.excerpt}</p>
            )}
          </div>
        )}

        {/* ✅ Mobile accordion for Further Reads */}
        {resources && (
          <div className="lg:hidden mt-6">
            <FurtherReads {...resources} />
          </div>
        )}
      </article>

      {/* ✅ Desktop sidebar revealed at end */}
      {resources && showResources && (
        <div className="hidden lg:block absolute right-0 bottom-24 w-72">
          <FurtherReads {...resources} />
        </div>
      )}

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleSave} // retry saving after login
      />
      <MembershipModal
        isOpen={showMembership}
        onClose={() => setShowMembership(false)}
      />
    </div>
  );
};

export default ArticleLayout;
