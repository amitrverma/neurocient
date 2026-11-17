import type { Metadata } from "next";

export const SITE_URL = "https://neurocient.com";
export const SOCIAL_IMAGE_PATH = "/images/social/neurocient-share-card-v2.png";
export const SOCIAL_IMAGE_URL = `${SITE_URL}${SOCIAL_IMAGE_PATH}`;
export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;
export const SOCIAL_IMAGE_ALT =
  "Neurocient Labs — Get more life, from life.";

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
          url: SOCIAL_IMAGE_URL,
          width: SOCIAL_IMAGE_WIDTH,
          height: SOCIAL_IMAGE_HEIGHT,
          alt: SOCIAL_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SOCIAL_IMAGE_URL],
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
