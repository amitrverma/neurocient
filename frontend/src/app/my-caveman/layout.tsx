import { noIndexMetadata } from "@/lib/searchMetadata";

export const metadata = {
  title: "My Caveman",
  ...noIndexMetadata,
};

export default function MyCavemanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
