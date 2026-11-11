import { noIndexMetadata } from "@/lib/searchMetadata";

export const metadata = {
  title: "Choose a New Password",
  ...noIndexMetadata,
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
