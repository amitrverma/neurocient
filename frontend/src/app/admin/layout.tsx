import AdminShell from "./AdminShell";
import { noIndexMetadata } from "@/lib/searchMetadata";

export const metadata = {
  title: "Administration",
  ...noIndexMetadata,
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
