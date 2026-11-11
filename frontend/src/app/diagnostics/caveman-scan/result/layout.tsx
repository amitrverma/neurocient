import { noIndexMetadata } from "@/lib/searchMetadata";

export const metadata = {
  title: "Your Inner Caveman Scan Result",
  ...noIndexMetadata,
};

export default function ScanResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
