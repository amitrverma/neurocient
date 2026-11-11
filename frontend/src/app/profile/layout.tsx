import type { ReactNode } from "react";
import { noIndexMetadata } from "@/lib/searchMetadata";

export const metadata = {
  title: "Profile | Inner Caveman",
  ...noIndexMetadata,
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

