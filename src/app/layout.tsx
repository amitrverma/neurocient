/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext"; // ✅ global auth provider
import { NotificationProvider } from "./components/NotificationProvider";
import PostHogProvider from "./components/PostHogProvider";
import PostHogInit from "./_components/PostHogInit";

export const dynamic = "force-dynamic";
// 📌 Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://neurocient.com"),
  title: {
    default: "The Neurocient Labsn",
    template: "%s | The Neurocient Labsn",
  },
  description: "Knowledge hub for your inner caveman",
  openGraph: {
    type: "website",
    siteName: "The Neurocient Labsn",
    url: "https://neurocient.com",
    title: "The Neurocient Labsn",
    description: "Knowledge hub for your inner caveman",
    images: [
      {
        url: "/logo/neurocient.png",
        width: 1200,
        height: 630,
        alt: "The Neurocient Labsn",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Neurocient Labsn",
    description: "Knowledge hub for your inner caveman",
    images: [
      "/logo/neurocient.png",
    ],
  },
};

// 📌 Root Layout
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
      </head>
      <body className="antialiased bg-white text-[#042a2b]">
        <NotificationProvider>
          {/* Initialize PostHog once, then attach global trackers */}
          <PostHogInit />
          <PostHogProvider />
          <AuthProvider>
            <Navbar />
            <main className="pt-20 font-serif">{children}</main>
            <Footer />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
