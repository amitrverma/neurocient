/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import "./nav-surfaces.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./components/NotificationProvider";
import PostHogProvider from "./components/PostHogProvider";
import OrgSchema from "./components/OrgSchema";
import PersonSchema from "./components/PersonSchema";
import WebSiteSchema from "./components/WebSiteSchema";
import { siteMetadata } from "./siteMetadata";

import { Toaster } from "react-hot-toast";

// 📌 Metadata
export const metadata = siteMetadata;

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
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400..800;1,400..800&display=swap"
          rel="stylesheet"
        />

        {/* PWA essentials */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#042a2b" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>

      <body className="antialiased bg-white text-[#042a2b]">
        <OrgSchema />
        <PersonSchema />
        <WebSiteSchema />

        {/* 🔥 Place toaster here — globally available, no provider restrictions */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: "var(--font-montserrat)",
            },
          }}
        />

        <NotificationProvider>
          <AuthProvider>
            <PostHogProvider>
              <Navbar />
              <div className="pt-16 font-serif">{children}</div>
              <Footer />
            </PostHogProvider>
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
