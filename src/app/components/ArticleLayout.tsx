"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import type React from "react";
import Link from "next/link";
import Script from "next/script"; // ✅ JSON-LD injection
import { Twitter, Linkedin, Mail } from "lucide-react";
import ScrollProgress from "./ui/ScrollProgress";
import FurtherReads from "./FurtherReads";
import type { PathwayId, ArticleRef } from "@/content/pathways";
import Newsletter from "./Newsletter";
import { useAuth } from "@/app/context/AuthContext";
import AuthModal from "./AuthModal";
import { useNotification } from "./NotificationProvider";
import { incrementUsage, usageLimits } from "../utils/usage";
import MembershipModal from "./MembershipModal";
import { trackEvent } from "../utils/analytics";
import { slugifyTag } from "../utils/slug";

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
  description?: string;   // ✅ SEO + JSON-LD
  keywords?: string[];    // ✅ SEO + JSON-LD
  author?: string;        // ✅ JSON-LD schema
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
  description,
  keywords = [],
  author = "Amit R Verma",
  tags = [],
  readingTime,
  slug,
  children,
  nextArticle,
  resources,
  pathway,
  prevInPath,
  nextInPath,
  spotPrompt,
}: ArticleLayoutProps) => {
  const baseUrl = "https://neurocient.com/insights";
  const articleUrl = slug ? `${baseUrl}/${slug}` : baseUrl;
  const orgId = "https://neurocient.com/#/org/neurocient-labs";
  const personId = "https://neurocient.com/#/person/amit-r-verma";

  // ✅ JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: description || excerpt,
    author:
      author === "Amit R Verma"
        ? { "@type": "Person", "@id": personId, name: author }
        : { "@type": "Person", name: author },
    datePublished: date,
    keywords: [...keywords, ...(tags || [])].join(", "),
    url: articleUrl,
    image: ["https://neurocient.com/logo/neurocient.png"],
    publisher: {
      "@type": "Organization",
      "@id": orgId,
      name: "Neurocient Labs",
      logo: {
        "@type": "ImageObject",
        url: "https://neurocient.com/logo/neurocient.png",
      },
    },
  };

  const { user, ready } = useAuth();
  const { notify } = useNotification();
  const [showResources, setShowResources] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showMembership, setShowMembership] = useState(false);
  const [authContext, setAuthContext] = useState<string | null>(null);
  const [authCallback, setAuthCallback] = useState<(() => void) | null>(null);
  const nextRef = useRef<HTMLDivElement | null>(null);

  // ✅ Detect if saved
  useEffect(() => {
    if (!user || !slug) return;
    const checkSaved = async () => {
      try {
        const res = await fetch(`/api/articles/saved/${slug}`, {
          method: "GET",
          credentials: "include",
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
  }, [slug, user]);

  // ✅ Track article view
  useEffect(() => {
    if (slug) trackEvent("Article Viewed", { slug });
  }, [slug]);

  // ✅ Mark as read
  useEffect(() => {
    if (!slug || !ready) return;
    let incremented = false;

    const markAsRead = async () => {
      if (incremented) return;
      incremented = true;
      try {
        await fetch(`/api/articles/${slug}/read`, {
          method: "POST",
          credentials: "include",
        });
        trackEvent("Article Read", { slug });

        if (user) {
          const usage = JSON.parse(localStorage.getItem("usage_user") || "{}");
          const articlesRead = usage.articles || 0;
          const limit = usageLimits.user.articles;
          if (articlesRead >= limit) setShowMembership(true);
        } else {
          const { allowed } = incrementUsage("articles", false);
          if (!allowed) {
            setAuthContext("continue reading");
            setShowAuth(true);
          }
        }
      } catch (err) {
        console.error("❌ Error incrementing read count:", err);
      }
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };

    const onScroll = () => {
      const scrolled =
        (window.scrollY + window.innerHeight) /
        document.documentElement.scrollHeight;
      if (scrolled >= 0.3) markAsRead();
    };

    const timeout = setTimeout(markAsRead, 15000);
    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timeout);
    };
  }, [slug, ready]);

  // ✅ Save / Unsave
  const handleSave = async (
    e?: React.MouseEvent<HTMLButtonElement>,
    skipAuthCheck = false,
  ) => {
    e?.preventDefault();
    if (!slug || !ready) return;
    if (!skipAuthCheck && !user) {
      setAuthContext("save this article");
      setAuthCallback(() => () => handleSave(undefined, true));
      setShowAuth(true);
      return;
    }
    try {
      const res = await fetch(`/api/articles/save/${slug}`, {
        method: isSaved ? "DELETE" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setIsSaved(!isSaved);
        if (!isSaved) trackEvent("Article Saved", { slug });
      } else {
        const data = await res.json();
        notify(data.detail || "Something went wrong", "error");
      }
    } catch (err) {
      console.error("❌ Error saving article:", err);
    }
  };

  // 🔄 Actions
  const renderActions = (extraClasses = "") => (
    <div className={`flex gap-4 ${extraClasses}`}>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
          articleUrl
        )}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Twitter"
      >
        <Twitter size={20} className="text-brand-dark hover:text-brand-primary" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          articleUrl
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on LinkedIn"
      >
        <Linkedin size={20} className="text-brand-dark hover:text-brand-primary" />
      </a>
      <a
        href={`mailto:?subject=${title}&body=${articleUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share via Email"
      >
        <Mail size={20} className="text-brand-dark hover:text-brand-primary" />
      </a>
      <button
        onClick={handleSave}
        className={`transition ${
          isSaved
            ? "text-brand-primary"
            : "text-brand-dark hover:text-brand-primary"
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5v14l7-7 7 7V5a2 2 0 00-2-2H7a2 2 0 00-2 2z" />
        </svg>
      </button>
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
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18h12v4H6v-4zM6 14h12" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="relative">
      <div className="sticky top-16 z-50 w-full bg-white dark:bg-brand-dark">
        <ScrollProgress />
      </div>

      <article className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 👉 Mobile actions */}
        <div className="flex lg:hidden mb-6">{renderActions()}</div>
        {/* 👉 Desktop actions */}
        <div className="hidden lg:flex flex-col gap-4 absolute -left-16 top-20">
          {renderActions("flex-col")}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs uppercase tracking-wide font-semibold">
          {tags?.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${slugifyTag(tag)}`}
              className="px-2 py-1 text-xs bg-gray-100 rounded-md hover:bg-brand-secondary"
            >
              {tag}
            </Link>
          ))}
          {readingTime && <span className="text-brand-dark">{readingTime}</span>}
        </div>

        {/* Title / Date / Excerpt */}
        <h1 className="text-4xl font-bold tracking-tight text-brand-dark mb-2">{title}</h1>
        <p className="text-sm text-brand-dark mb-6">{date}</p>
        {excerpt && <p className="text-lg text-brand-dark mb-8 italic">{excerpt}</p>}

        {/* Content */}
        <div className="prose prose-article text-[18px]">{children}</div>

        {/* Newsletter */}
        <div className="mt-12">
          <Newsletter
            subtext="Enjoyed this? Get one fresh insight each week straight to your inbox."
            logoSrc="/logo/newsletter.png"
          />
        </div>

        {/* Pathway nav */}
        {pathway && (
          <div className="mt-16 border-t pt-8 text-md text-brand-dark">
            <p>
              This article is part of the{" "}
              <Link
                href={`/pathways?open=${pathway.id}`}
                className="text-brand-primary hover:underline"
              >
                {pathway.title}
              </Link>{" "}
              Pathway.
            </p>
            <div className="flex justify-between mt-3">
              {prevInPath ? (
                <Link href={`/insights/${prevInPath.slug}`} className="hover:underline">
                  ← {prevInPath.title}
                </Link>
              ) : (
                <span />
              )}
              {nextInPath ? (
                <Link href={`/insights/${nextInPath.slug}`} className="hover:underline">
                  {nextInPath.title} →
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        )}

        {/* Random read next */}
        {nextArticle && (
          <div ref={nextRef} className="mt-16 border-t pt-8">
            <p className="text-md text-brand-dark mb-2">You might also like:</p>
            <Link
              href={`/insights/${nextArticle.slug}`}
              className="text-xl font-semibold text-brand-teal hover:text-brand-primary transition"
            >
              {nextArticle.title}
            </Link>
            {nextArticle.excerpt && (
              <p className="text-brand-dark text-md mt-1">{nextArticle.excerpt}</p>
            )}
          </div>
        )}

        {/* Mobile further reads */}
        {resources && (
          <div className="lg:hidden mt-6">
            <FurtherReads {...resources} />
          </div>
        )}
      </article>

      {/* Desktop further reads */}
      {resources && showResources && (
        <div className="hidden lg:block absolute right-0 bottom-24 w-72">
          <FurtherReads {...resources} />
        </div>
      )}

      {/* Auth / Membership */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        context={authContext || undefined}
        onSuccess={() => {
          setShowAuth(false);
          if (authCallback) {
            setTimeout(() => {
              authCallback();
              setAuthCallback(null);
            }, 0);
          }
        }}
        disableEscape
      />
      <MembershipModal
        isOpen={showMembership}
        onClose={() => setShowMembership(false)}
        disableEscape
      />

      {/* ✅ JSON-LD */}
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
};

export default ArticleLayout;
