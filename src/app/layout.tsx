import type { Metadata } from "next";
import { Quattrocento, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { AuthProvider } from "./context/AuthContext"; // ✅ global auth provider
import { NotificationProvider } from "./components/NotificationProvider";
import PostHogInit from "./_components/PostHogInit";

// 🎨 Fonts
const quattrocento = Quattrocento({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-quattrocento",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});

// 📌 Metadata
export const metadata: Metadata = {
  title: "The Modern Caveman",
  description: "Knowledge hub for your inner caveman",
};

// 📌 Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <html lang="en" className={`${quattrocento.variable} ${montserrat.variable}`}>
    <body className="antialiased bg-white text-[#042a2b]">
      <NotificationProvider>
        <AuthProvider>
          <PostHogInit /> {/* ✅ Initialize PostHog globally */}
          <Navbar />
          <main className="pt-20 font-serif">{children}</main>
          <Footer />
        </AuthProvider>
      </NotificationProvider>
    </body>
  </html>
);
}
