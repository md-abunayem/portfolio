import type { ReactNode } from "react";
import { AdminGuard } from "@/features/admin/admin-shell";

export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}
