import type { Metadata } from "next";
import { AdminLogin } from "@/features/admin/admin-login";

export const metadata: Metadata = {
  title: "Admin sign in",
};

export default function AdminLoginPage() {
  return <AdminLogin />;
}
