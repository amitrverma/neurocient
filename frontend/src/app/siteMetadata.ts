import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/businessIdentity";

export const siteMetadata: Metadata = {
  metadataBase: new URL("https://neurocient.com"),
  title: {
    default: BRAND_NAME,
    template: `%s | ${BRAND_NAME}`,
  },
  alternates: {
    canonical: "https://neurocient.com",
  },
  description: "Uncover. Discover. Work with your Inner Caveman.",
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    url: "https://neurocient.com",
    title: `${BRAND_NAME} | Inner Caveman`,
    description: "Uncover. Discover. Work with your Inner Caveman.",
    images: [
      {
        url: "/logo/neurocient.png",
        width: 1200,
        height: 630,
        alt: BRAND_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} | Inner Caveman`,
    description: "Uncover. Discover. Work with your Inner Caveman.",
    images: ["/logo/neurocient.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
    apple: "/icons/icon-192.png",
  },
};
