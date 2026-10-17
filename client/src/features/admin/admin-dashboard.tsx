"use client";

import { LoaderCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteMessage,
  getCollectionPage,
  getRecentMessages,
  getUnreadMessageCount,
  removeRecord,
  saveRecord,
  updateMessageStatus,
} from "./admin-api";
import { ResourceEditor } from "./resource-editor";
import { resources } from "./resources";
import type { ContactMessage, Project } from "@/types/portfolio";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [projectTotal, setProjectTotal] = useState(0);
  const [publishedTotal, setPublishedTotal] = useState(0);
  const [draftTotal, setDraftTotal] = useState(0);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | undefined>();
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyMessageIds, setBusyMessageIds] = useState<string[]>([]);
  const [busyProjectIds, setBusyProjectIds] = useState<string[]>([]);

  const loadDashboard = useCallback(async () => {
    try {
      const [projectPage, messagePage, unreadCount] = await Promise.all([
        getCollectionPage<Project>("projects", 1, 100),
        getRecentMessages(),
        getUnreadMessageCount(),
      ]);
      const totalPages = Math.ceil(projectPage.total / projectPage.pageSize);
      const extraPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          getCollectionPage<Project>("projects", index + 2, 100),
        ),
      );
      const allProjects = [
        ...projectPage.items,
        ...extraPages.flatMap((page) => page.items),
      ];
      setProjects(allProjects);
      setProjectTotal(projectPage.total);
      setPublishedTotal(allProjects.filter((project) => project.status === "PUBLISHED").length);
      setDraftTotal(allProjects.filter((project) => project.status === "DRAFT").length);
      setRecentMessages(messagePage.items);
      setUnreadTotal(unreadCount);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDashboard(), 0);
    return () => window.clearTimeout(timer);
  }, [loadDashboard]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((project) =>
      `${project.title} ${project.description}`.toLowerCase().includes(query),
    );
  }, [projects, search]);

  async function handleProjectSave(payload: Record<string, unknown>) {
    setSaving(true);
    setActionError("");
    try {
      await saveRecord<Project>(
        "admin/projects",
        payload,
        editProject?.id,
      );
      setActionMessage(`Project ${editProject ? "updated" : "created"}.`);
      setEditorOpen(false);
      setEditProject(undefined);
      await loadDashboard();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Could not save project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleProjectDelete(project: Project) {
    if (!window.confirm(`Delete “${project.title}”? This cannot be undone.`)) return;
    setBusyProjectIds((current) => [...current, project.id]);
    setActionError("");
    try {
      await removeRecord("admin/projects", project.id);
      setActionMessage("Project deleted.");
      await loadDashboard();
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Could not delete project.");
    } finally {
      setBusyProjectIds((current) => current.filter((id) => id !== project.id));
    }
  }

  async function handleMessageStatus(message: ContactMessage, status: ContactMessage["status"]) {
    setBusyMessageIds((current) => [...current, message.id]);
    setActionError("");
    try {
      const updated = await updateMessageStatus(message.id, status);
      setRecentMessages((current) => current.map((item) => item.id === message.id ? updated : item));
      if (message.status === "UNREAD" && updated.status !== "UNREAD") {
        setUnreadTotal((count) => Math.max(0, count - 1));
      }
      setActionMessage("Message status updated.");
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Could not update message.");
    } finally {
      setBusyMessageIds((current) => current.filter((id) => id !== message.id));
    }
  }

  async function handleMessageDelete(message: ContactMessage) {
    if (!window.confirm(`Delete the message from ${message.name}? This cannot be undone.`)) return;
    setBusyMessageIds((current) => [...current, message.id]);
    setActionError("");
    try {
      await deleteMessage(message.id);
      setRecentMessages((current) => current.filter((item) => item.id !== message.id));
      if (message.status === "UNREAD") setUnreadTotal((count) => Math.max(0, count - 1));
      setActionMessage("Message deleted.");
    } catch (cause) {
      setActionError(cause instanceof Error ? cause.message : "Could not delete message.");
    } finally {
      setBusyMessageIds((current) => current.filter((id) => id !== message.id));
    }
  }

  return (
    <section className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Admin / Dashboard</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Overview</h1>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          onClick={() => {
            setEditProject(undefined);
            setActionError("");
            setEditorOpen(true);
          }}
          type="button"
        >
          <Plus aria-hidden="true" size={16} />
          New project
        </button>
      </div>

      {actionMessage && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {actionMessage}
          <button className="font-semibold" onClick={() => setActionMessage("")} type="button">Dismiss</button>
        </div>
      )}
      {actionError && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {actionError}
        </p>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
          <button
            className="ml-3 font-semibold underline"
            onClick={() => {
              setLoading(true);
              setError("");
              void loadDashboard();
            }}
            type="button"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <StatCard label="Total projects" value={projectTotal} loading={loading} />
        <StatCard label="Published" value={publishedTotal} loading={loading} tone="green" />
        <StatCard label="Drafts" value={draftTotal} loading={loading} tone="slate" />
        <StatCard label="Unread messages" value={unreadTotal} loading={loading} tone="indigo" />
      </div>

      <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Projects</h2>
            <p className="mt-0.5 text-xs text-slate-500">Manage portfolio projects and publication status.</p>
          </div>
          <label className="relative block w-full sm:w-56">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search projects"
              value={search}
            />
          </label>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-slate-500">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
            Loading projects…
          </div>
        ) : projects.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            <p className="font-semibold text-slate-800">No projects yet.</p>
            <button className="mt-2 font-semibold text-indigo-700 hover:text-indigo-900" onClick={() => setEditorOpen(true)} type="button">
              Create your first project
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No projects match your search.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] border-collapse text-left text-sm">
              <thead className="bg-white text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-4 py-3 sm:px-5">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3 sm:px-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr className="border-t border-slate-100" key={project.id}>
                    <td className="max-w-[280px] truncate px-4 py-3.5 font-semibold text-slate-800 sm:px-5">{project.title}</td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide ${
                        project.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{project.featured ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 sm:px-5">
                      <div className="flex gap-2">
                        <button
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                          onClick={() => {
                            setEditProject(project);
                            setActionError("");
                            setEditorOpen(true);
                          }}
                          type="button"
                        >
                          <Pencil aria-hidden="true" size={13} /> Edit
                        </button>
                        <button
                          aria-label={`Delete ${project.title}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          disabled={busyProjectIds.includes(project.id)}
                          onClick={() => void handleProjectDelete(project)}
                          type="button"
                        >
                          <Trash2 aria-hidden="true" size={13} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex justify-end border-t border-slate-100 px-4 py-3 sm:px-5">
          <Link className="text-xs font-semibold text-indigo-700 hover:text-indigo-900" href="/admin/projects">
            Manage all projects
          </Link>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent messages</h2>
            <p className="mt-0.5 text-xs text-slate-500">Latest messages received from your portfolio.</p>
          </div>
          <Link className="text-xs font-semibold text-indigo-700 hover:text-indigo-900" href="/admin/messages">
            View all
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-slate-500">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
            Loading messages…
          </div>
        ) : recentMessages.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-500">No messages received yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentMessages.map((message) => {
              const busy = busyMessageIds.includes(message.id);
              return (
                <article className="grid gap-3 px-4 py-4 sm:grid-cols-[150px_minmax(0,1fr)_auto_auto] sm:items-center sm:px-5" key={message.id}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{message.name}</p>
                    <a className="truncate text-xs text-slate-500 hover:text-indigo-700" href={`mailto:${message.email}`}>
                      {message.email}
                    </a>
                  </div>
                  <div className="min-w-0">
                    {message.subject && <p className="truncate text-xs font-semibold text-slate-700">{message.subject}</p>}
                    <p className="line-clamp-2 text-sm text-slate-600">{message.message}</p>
                    <time className="mt-1 block text-[11px] text-slate-400" dateTime={message.createdAt}>
                      {formatDate(message.createdAt)}
                    </time>
                  </div>
                  <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold ${
                    message.status === "UNREAD"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {message.status}
                  </span>
                  <div className="flex gap-2 sm:justify-end">
                    {message.status === "UNREAD" && (
                      <button
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                        disabled={busy}
                        onClick={() => void handleMessageStatus(message, "READ")}
                        type="button"
                      >
                        Mark read
                      </button>
                    )}
                    {message.status === "READ" && (
                      <button
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                        disabled={busy}
                        onClick={() => void handleMessageStatus(message, "REPLIED")}
                        type="button"
                      >
                        Mark replied
                      </button>
                    )}
                    <button
                      aria-label={`Delete message from ${message.name}`}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      disabled={busy}
                      onClick={() => void handleMessageDelete(message)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {editorOpen && (
        <ResourceEditor
          error={actionError}
          onCancel={() => {
            setEditorOpen(false);
            setEditProject(undefined);
            setActionError("");
          }}
          onSubmit={(payload) => void handleProjectSave(payload)}
          record={editProject as (Project & Record<string, unknown>) | undefined}
          resource={resources.projects}
          saving={saving}
        />
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
  loading,
  tone = "default",
}: {
  label: string;
  value: number;
  loading: boolean;
  tone?: "default" | "green" | "slate" | "indigo";
}) {
  const valueClass = {
    default: "text-slate-900",
    green: "text-emerald-800",
    slate: "text-slate-900",
    indigo: "text-indigo-700",
  }[tone];
  return (
    <article className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold leading-none tracking-tight ${valueClass}`}>
        {loading ? <span className="text-slate-300">—</span> : value}
      </p>
    </article>
  );
}
