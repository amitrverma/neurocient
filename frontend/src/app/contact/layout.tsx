import type { ReactNode } from "react";
import { createPublicMetadata } from "@/lib/searchMetadata";

export const metadata = createPublicMetadata({
  title: "Contact",
  description:
    "Contact Neurocient Labs about programs, partnerships, workplace learning, or general questions.",
  path: "/contact",
});

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

