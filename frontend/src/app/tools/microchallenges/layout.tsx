import { noIndexMetadata } from "@/lib/searchMetadata";

export const metadata = {
  title: "My Microchallenges",
  ...noIndexMetadata,
};

export default function MicrochallengesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
