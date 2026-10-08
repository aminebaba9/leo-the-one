import type { ReactNode } from "react";
import AdminShell from "@/app/admin/admin-shell";

export const dynamic = "force-dynamic";

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
