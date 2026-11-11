import { noIndexMetadata } from "@/lib/searchMetadata";

export const metadata = {
  title: "Reset Password",
  ...noIndexMetadata,
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
