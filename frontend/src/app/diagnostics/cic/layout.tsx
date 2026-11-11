import { noIndexMetadata } from "@/lib/searchMetadata";

export const metadata = {
  title: "Caveman Instinct Check",
  ...noIndexMetadata,
};

export default function CicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
