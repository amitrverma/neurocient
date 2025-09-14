/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext"; // ✅ global auth provider
import { NotificationProvider } from "./components/NotificationProvider";
import PostHogProvider from "./components/PostHogProvider";

export const dynamic = "force-dynamic";

// 📌 Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://neurocient.com"),
  title: {
    default: "The Neurocient Labs",
    template: "%s | The Neurocient Labs",
  },
  alternates: {
    canonical: "https://neurocient.com", // 👈 canonical link
  },
  description: "Uncover. Discover. Work with your Inner Caveman.",
  openGraph: {
    type: "website",
    siteName: "The Neurocient Labs",
    url: "https://neurocient.com",
    title: "The Neurocient Labs",
    description: "Uncover. Discover. Work with your Inner Caveman.",
    images: [
      {
        url: "/logo/neurocient.png",
        width: 1200,
        height: 630,
        alt: "The Neurocient Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Neurocient Labs",
    description: "Uncover. Discover. Work with your Inner Caveman.",
    images: ["/logo/neurocient.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
    apple: "/icons/icon-192.png", // 👈 better than favicon
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Quattrocento:wght@400;700&display=swap"
          rel="stylesheet"
        />

        {/* ✅ PWA essentials */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#042a2b" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased bg-white text-[#042a2b]">
        <NotificationProvider>
          <AuthProvider>
            <PostHogProvider>
              <Navbar />
              <main className="pt-20 font-serif">{children}</main>
              <Footer />
            </PostHogProvider>
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
