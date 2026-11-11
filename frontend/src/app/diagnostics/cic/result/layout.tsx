import { noIndexMetadata } from "@/lib/searchMetadata";

export const metadata = {
  title: "Your Caveman Instinct Check Result",
  ...noIndexMetadata,
};

export default function CicResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
