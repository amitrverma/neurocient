import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./insights.css";

export const metadata: Metadata = {
  title: "Insights | Inner Caveman",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

