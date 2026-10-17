"use client";

import { LoaderCircle, MailOpen, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteMessage, getCollectionPage, updateMessageStatus } from "./admin-api";
import type { ContactMessage } from "@/types/portfolio";
import type { PaginatedData } from "@/types/api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export function AdminMessages() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedData<ContactMessage> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");

  const loadMessages = useCallback(async () => {
    try {
      setData(await getCollectionPage<ContactMessage>("messages", page, 25));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load messages.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadMessages(), 0);
    return () => window.clearTimeout(timer);
  }, [loadMessages]);

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data?.items ?? [];
    return (data?.items ?? []).filter((message) =>
      `${message.name} ${message.email} ${message.subject ?? ""} ${message.message}`
        .toLowerCase()
        .includes(query),
    );
  }, [data, search]);

  async function changeStatus(message: ContactMessage, status: ContactMessage["status"]) {
    setBusyIds((current) => [...current, message.id]);
    setError("");
    try {
      const updated = await updateMessageStatus(message.id, status);
      setData((current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) => item.id === message.id ? updated : item),
            }
          : current,
      );
      setNotice(`Message marked ${status.toLowerCase()}.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update message.");
    } finally {
      setBusyIds((current) => current.filter((id) => id !== message.id));
    }
  }

  async function remove(message: ContactMessage) {
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return;
    setBusyIds((current) => [...current, message.id]);
    setError("");
    try {
      await deleteMessage(message.id);
      setData((current) =>
        current
          ? { ...current, items: current.items.filter((item) => item.id !== message.id), total: current.total - 1 }
          : current,
      );
      setNotice("Message deleted.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete message.");
    } finally {
      setBusyIds((current) => current.filter((id) => id !== message.id));
    }
  }

  return (
    <section className="mx-auto max-w-[1200px]">
      <div className="mb-6">
        <p className="mb-1 text-xs font-medium text-slate-500">Admin / Messages</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Messages</h1>
        <p className="mt-1 text-sm text-slate-500">Review contact requests and keep track of replies.</p>
      </div>
      {notice && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {notice}
          <button className="font-semibold" onClick={() => setNotice("")} type="button">Dismiss</button>
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
          <button
            className="ml-3 font-semibold underline"
            onClick={() => {
              setLoading(true);
              setError("");
              void loadMessages();
            }}
            type="button"
          >
            Retry
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Inbox</h2>
            <p className="mt-0.5 text-xs text-slate-500">{data?.total ?? 0} total messages</p>
          </div>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:w-64"
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search messages"
            value={search}
          />
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-500">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
            Loading messages…
          </div>
        ) : filteredMessages.length === 0 ? (
          <p className="px-5 py-14 text-center text-sm text-slate-500">
            {search ? "No messages match your search." : "No messages received yet."}
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredMessages.map((message) => {
              const busy = busyIds.includes(message.id);
              return (
                <article className="grid gap-3 p-4 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-start sm:p-5" key={message.id}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{message.name}</p>
                    <a className="break-all text-xs text-slate-500 hover:text-indigo-700" href={`mailto:${message.email}`}>
                      {message.email}
                    </a>
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {message.subject && <h3 className="text-sm font-semibold text-slate-800">{message.subject}</h3>}
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        message.status === "UNREAD"
                          ? "bg-indigo-100 text-indigo-700"
                          : message.status === "REPLIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                      }`}>
                        {message.status}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">{message.message}</p>
                    <time className="mt-2 block text-xs text-slate-400" dateTime={message.createdAt}>
                      {formatDate(message.createdAt)}
                    </time>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    {message.status === "UNREAD" && (
                      <button
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                        disabled={busy}
                        onClick={() => void changeStatus(message, "READ")}
                        type="button"
                      >
                        <MailOpen aria-hidden="true" size={14} /> Mark read
                      </button>
                    )}
                    {message.status === "READ" && (
                      <button
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                        disabled={busy}
                        onClick={() => void changeStatus(message, "REPLIED")}
                        type="button"
                      >
                        Mark replied
                      </button>
                    )}
                    <button
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      disabled={busy}
                      onClick={() => void remove(message)}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" size={14} /> Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {data && data.total > data.pageSize && (
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
            <span className="text-slate-500">Page {data.page} of {Math.ceil(data.total / data.pageSize)}</span>
            <div className="flex gap-2">
              <button
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                type="button"
              >
                Previous
              </button>
              <button
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-40"
                disabled={page >= Math.ceil(data.total / data.pageSize)}
                onClick={() => setPage((current) => current + 1)}
                type="button"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
