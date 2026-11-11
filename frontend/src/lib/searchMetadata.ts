import type { Metadata } from "next";

export const SITE_URL = "https://neurocient.com";

type PublicMetadataInput = {
  title: string;
  description: string;
  path: `/${string}` | "/";
  keywords?: string[];
};

export function createPublicMetadata({
  title,
  description,
  path,
  keywords,
}: PublicMetadataInput): Metadata {
  const canonical = path === "/" ? SITE_URL : `${SITE_URL}${path}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "Neurocient Labs",
      images: [
        {
          url: "/logo/neurocient.png",
          width: 1200,
          height: 630,
          alt: "Neurocient Labs",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo/neurocient.png"],
    },
  };
}

export const noIndexMetadata: Metadata = {
  alternates: { canonical: null },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};
