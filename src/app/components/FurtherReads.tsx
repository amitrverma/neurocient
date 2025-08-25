"use client";

import { useState } from "react";
import Link from "next/link";

interface ResourceItem {
  title: string;
  href?: string;
}

interface ArticleResources {
  books?: string[];
  research?: string[];
  internal?: ResourceItem[];
}

const FurtherReads = ({ books = [], research = [], internal = [] }: ArticleResources) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* ✅ Desktop floating card */}
      <aside className="hidden lg:block fixed bottom-8 right-8 w-72 bg-white shadow-lg rounded-xl p-4 border">
        <h3 className="text-lg font-bold mb-3">Further Reads</h3>
        <div className="space-y-4 text-sm">
          {books.length > 0 && (
            <div>
              <h4 className="font-semibold mb-1">Books</h4>
              <div className="space-y-1">
                {books.map((b, i) => (
                  <p key={i}>{b}</p>
                ))}
              </div>
            </div>
          )}

          {research.length > 0 && (
            <div>
              <h4 className="font-semibold mb-1">Research</h4>
              <div className="space-y-1">
                {research.map((r, i) => (
                  <p key={i}>{r}</p>
                ))}
              </div>
            </div>
          )}

          {internal.length > 0 && (
            <div>
              <h4 className="font-semibold mb-1">From Amit’s Library</h4>
              <div className="space-y-1">
                {internal.map((l, i) => (
                  <p key={i}>
                    {l.href ? (
                      <Link href={l.href} className="text-blue-600 hover:underline">
                        {l.title}
                      </Link>
                    ) : (
                      l.title
                    )}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ✅ Mobile accordion */}
      <div className="block lg:hidden mt-6">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 rounded-md font-semibold"
        >
          Further Reads
          <span>{open ? "−" : "+"}</span>
        </button>

        {open && (
          <div className="mt-3 space-y-4 px-4 text-sm">
            {books.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Books</h4>
                <div className="space-y-1">
                  {books.map((b, i) => (
                    <p key={i}>{b}</p>
                  ))}
                </div>
              </div>
            )}

            {research.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">Research</h4>
                <div className="space-y-1">
                  {research.map((r, i) => (
                    <p key={i}>{r}</p>
                  ))}
                </div>
              </div>
            )}

            {internal.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1">From Amit’s Library</h4>
                <div className="space-y-1">
                  {internal.map((l, i) => (
                    <p key={i}>
                      {l.href ? (
                        <Link href={l.href} className="text-blue-600 hover:underline">
                          {l.title}
                        </Link>
                      ) : (
                        l.title
                      )}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default FurtherReads;
