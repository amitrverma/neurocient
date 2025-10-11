import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Spot Your Caveman | Inner Caveman",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

