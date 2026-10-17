"use client";

import { ArrowLeft, LoaderCircle, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { signIn } from "./admin-api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function getSafeNextPath() {
    const nextPath = searchParams?.get("next");
    if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
      return "/admin";
    }
    return nextPath;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
      router.replace(getSafeNextPath());
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
      <div className="mb-6 grid size-12 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
        <LockKeyhole aria-hidden="true" size={22} />
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">Portfolio Admin</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in to manage your portfolio content.</p>

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="email">
            Email
          </label>
          <input
            autoComplete="username"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            id="email"
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
            type="email"
            value={email}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="password">
            Password
          </label>
          <input
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            id="password"
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
            type="password"
            value={password}
          />
        </div>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading && <LoaderCircle aria-hidden="true" className="animate-spin" size={16} />}
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <Link className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900" href="/">
        <ArrowLeft aria-hidden="true" size={15} />
        Back to portfolio
      </Link>
    </div>
  );
}

export function AdminLogin() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f5f8] px-4 py-8">
      <Suspense fallback={<p className="text-sm text-slate-500">Loading sign-in…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
