"use client";

import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { getCurrentAdmin, isUnauthorizedError, signOut } from "./admin-api";
import { adminNavigation } from "./resources";
import type { AdminUser } from "@/types/portfolio";

const navigationIcons = {
  dashboard: LayoutDashboard,
  projects: FolderKanban,
  skills: Code2,
  experience: BriefcaseBusiness,
  education: GraduationCap,
  certifications: Award,
  achievements: Award,
  research: BookOpen,
  messages: Mail,
  profile: UserRound,
};

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdmin = useCallback(async () => {
    try {
      setAdmin(await getCurrentAdmin());
    } catch (cause) {
      if (isUnauthorizedError(cause)) {
        const next = `${window.location.pathname}${window.location.search}`;
        router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
        return;
      }
      setError(cause instanceof Error ? cause.message : "Could not verify your session.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAdmin(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAdmin]);

  if (loading || !admin) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-5 text-slate-700">
        {error ? (
          <div className="max-w-md rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
            <p className="font-medium text-red-700">{error}</p>
            <button
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              onClick={() => {
                setLoading(true);
                setError("");
                void loadAdmin();
              }}
              type="button"
            >
              Try again
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Checking administrator session…</p>
        )}
      </main>
    );
  }

  return <AdminShell admin={admin}>{children}</AdminShell>;
}

function AdminShell({ admin, children }: { admin: AdminUser; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [logoutError, setLogoutError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await signOut();
      router.replace("/admin/login");
    } catch (cause) {
      setLogoutError(cause instanceof Error ? cause.message : "Could not sign out.");
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f5f8] text-slate-900">
      <aside className="flex min-h-0 flex-col bg-[#101116] px-3 py-4 text-slate-300 sm:px-4 lg:fixed lg:inset-y-0 lg:left-0 lg:z-20 lg:w-[200px] lg:px-3 lg:py-4">
        <Link
          className="mb-5 px-2 py-1 text-[15px] font-bold tracking-tight text-white"
          href="/admin"
        >
          Portfolio Admin
        </Link>
        <nav
          aria-label="Admin navigation"
          className="flex gap-1 overflow-x-auto pb-1 lg:flex-1 lg:flex-col lg:gap-1 lg:overflow-visible"
        >
          {adminNavigation.map((item) => {
            const Icon = navigationIcons[item.icon];
            const currentPath = pathname ?? "";
            const active =
              item.href === "/admin" ? currentPath === "/admin" : currentPath.startsWith(item.href);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-[#222630] text-white"
                    : "text-slate-300 hover:bg-[#1b1e26] hover:text-white"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3 lg:mt-auto lg:block lg:border-0 lg:pt-0">
          <div className="min-w-0 text-xs lg:hidden">
            <p className="truncate font-semibold text-white">{admin.name}</p>
            <p className="truncate text-slate-400">{admin.email}</p>
          </div>
          {logoutError && (
            <p className="mb-2 hidden text-xs text-red-300 lg:block" role="alert">
              {logoutError}
            </p>
          )}
          <button
            className="flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] font-medium text-slate-300 hover:bg-[#1b1e26] hover:text-white disabled:opacity-50 lg:w-full"
            disabled={loggingOut}
            onClick={() => void handleLogout()}
            type="button"
          >
            <LogOut aria-hidden="true" size={16} />
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
          {logoutError && (
            <p className="mt-1 text-xs text-red-300 lg:hidden" role="alert">
              {logoutError}
            </p>
          )}
          <p className="mt-2 hidden truncate px-2.5 text-[11px] text-slate-500 lg:block">
            {admin.name}
          </p>
        </div>
      </aside>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-[200px] lg:px-6 lg:py-6 xl:px-8">
        {children}
      </main>
    </div>
  );
}
