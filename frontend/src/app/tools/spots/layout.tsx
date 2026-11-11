import { noIndexMetadata } from "@/lib/searchMetadata";

export const metadata = {
  title: "My Inner Caveman Spots",
  ...noIndexMetadata,
};

export default function SpotsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
