import type { Metadata } from "next";
import { BRAND_NAME } from "@/lib/businessIdentity";
import {
  SOCIAL_IMAGE_ALT,
  SOCIAL_IMAGE_HEIGHT,
  SOCIAL_IMAGE_URL,
  SOCIAL_IMAGE_WIDTH,
} from "@/lib/searchMetadata";

export const siteMetadata: Metadata = {
  metadataBase: new URL("https://neurocient.com"),
  title: {
    default: "A platform to understand and work with human nature",
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    "Understand the automatic responses behind procrastination, worry, comparison, scrolling, and other patterns—then work with what is actually driving them.",
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    url: "https://neurocient.com",
    title: "A platform to understand and work with human nature",
    description:
      "Understand the automatic responses behind procrastination, worry, comparison, scrolling, and other patterns.",
    images: [
      {
        url: SOCIAL_IMAGE_URL,
        width: SOCIAL_IMAGE_WIDTH,
        height: SOCIAL_IMAGE_HEIGHT,
        alt: SOCIAL_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "A platform to understand and work with human nature",
    description:
      "Understand the automatic responses behind procrastination, worry, comparison, scrolling, and other patterns.",
    images: [SOCIAL_IMAGE_URL],
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
