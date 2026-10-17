"use client";

import { LoaderCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCollectionPage,
  loadProfile,
  removeRecord,
  saveProfile,
  saveRecord,
} from "./admin-api";
import { ResourceEditor } from "./resource-editor";
import type { AdminResource } from "./resources";
import type { PaginatedData } from "@/types/api";

type ResourceRecord = Record<string, unknown> & { id?: string };

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        item && typeof item === "object" && "name" in item
          ? String(item.name)
          : String(item),
      )
      .join(", ");
  }
  if (typeof value === "string" && /^\d{4}-\d\d-\d\dT/.test(value)) {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
  }
  return String(value);
}

export function AdminResourcePage({
  resource,
  singleton = false,
}: {
  resource: AdminResource;
  singleton?: boolean;
}) {
  const [items, setItems] = useState<ResourceRecord[]>([]);
  const [record, setRecord] = useState<ResourceRecord | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginatedData<ResourceRecord> | null>(null);

  const loadItems = useCallback(async () => {
    try {
      if (singleton) {
        const profile = await loadProfile<ResourceRecord>();
        setItems([profile]);
        setRecord(profile);
        return;
      }
      const data = await getCollectionPage<ResourceRecord>(resource.apiPath.replace(/^admin\//, ""), page, 100);
      setPagination(data);
      setItems(data.items);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Could not load ${resource.title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [page, resource.apiPath, resource.title, singleton]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadItems(), 0);
    return () => window.clearTimeout(timer);
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      [item[resource.titleField], resource.secondaryField ? item[resource.secondaryField] : ""]
        .some((value) => typeof value === "string" && value.toLowerCase().includes(query)),
    );
  }, [items, resource.secondaryField, resource.titleField, search]);

  async function handleSave(payload: Record<string, unknown>) {
    setSaving(true);
    setError("");
    try {
      if (singleton) {
        const updated = await saveProfile<ResourceRecord>(payload);
        setRecord(updated);
        setItems([updated]);
      } else {
        await saveRecord<ResourceRecord>(
          resource.apiPath,
          payload,
          typeof record?.id === "string" ? record.id : undefined,
        );
      }
      setEditorOpen(false);
      setRecord(undefined);
      setSuccess(`${resource.singular[0].toUpperCase()}${resource.singular.slice(1)} ${record?.id ? "updated" : "created"}.`);
      await loadItems();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Could not save ${resource.singular}.`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: ResourceRecord) {
    if (!item.id || !window.confirm(`Delete this ${resource.singular}? This cannot be undone.`)) return;
    setError("");
    try {
      await removeRecord(resource.apiPath, item.id);
      setSuccess(`${resource.singular[0].toUpperCase()}${resource.singular.slice(1)} deleted.`);
      await loadItems();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Could not delete ${resource.singular}.`);
    }
  }

  function openCreate() {
    setRecord(undefined);
    setError("");
    setEditorOpen(true);
  }

  function openEdit(item: ResourceRecord) {
    setRecord(item);
    setError("");
    setEditorOpen(true);
  }

  return (
    <section className="mx-auto max-w-[1200px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium text-slate-500">Admin / {resource.title}</p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">{resource.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{resource.description}</p>
        </div>
        {!singleton && (
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            onClick={openCreate}
            type="button"
          >
            <Plus aria-hidden="true" size={17} />
            New {resource.singular}
          </button>
        )}
      </div>

      {success && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">
          {success}
          <button className="font-semibold" onClick={() => setSuccess("")} type="button">Dismiss</button>
        </div>
      )}
      {error && !editorOpen && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
          <button className="ml-3 font-semibold underline" onClick={() => void loadItems()} type="button">Retry</button>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">{singleton ? "Public profile" : resource.title}</h2>
            {!singleton && (
              <p className="mt-0.5 text-xs text-slate-500">
                {pagination?.total ?? (loading ? "…" : items.length)} total
              </p>
            )}
          </div>
          {!singleton && (
            <label className="relative block w-full sm:w-56">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder={`Search ${resource.title.toLowerCase()}`}
                value={search}
              />
            </label>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 px-5 py-16 text-sm text-slate-500">
            <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
            Loading {resource.title.toLowerCase()}…
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="font-semibold text-slate-800">
              {search ? "No matching records" : singleton ? "Profile not found" : `No ${resource.title.toLowerCase()} yet`}
            </p>
            {!singleton && !search && (
              <button className="mt-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900" onClick={openCreate} type="button">
                Create your first {resource.singular}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {filteredItems.map((item, index) => (
                <div className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5" key={item.id ?? index}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {displayValue(item[resource.titleField])}
                    </p>
                    {resource.secondaryField && (
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                        {displayValue(item[resource.secondaryField])}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      {item.updatedAt ? `Updated ${displayValue(item.updatedAt)}` : item.id ? `ID ${String(item.id).slice(0, 12)}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      onClick={() => openEdit(item)}
                      type="button"
                    >
                      <Pencil aria-hidden="true" size={14} />
                      {singleton ? "Edit profile" : "Edit"}
                    </button>
                    {!singleton && (
                      <button
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                        onClick={() => void handleDelete(item)}
                        type="button"
                      >
                        <Trash2 aria-hidden="true" size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!singleton && pagination && pagination.total > pagination.pageSize && (
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm">
                <span className="text-slate-500">
                  Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
                </span>
                <div className="flex gap-2">
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-40"
                    disabled={page <= 1}
                    onClick={() => {
                      setLoading(true);
                      setError("");
                      setPage((current) => Math.max(1, current - 1));
                    }}
                    type="button"
                  >
                    Previous
                  </button>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium disabled:opacity-40"
                    disabled={page >= Math.ceil(pagination.total / pagination.pageSize)}
                    onClick={() => {
                      setLoading(true);
                      setError("");
                      setPage((current) => current + 1);
                    }}
                    type="button"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {editorOpen && (
        <ResourceEditor
          error={error}
          onCancel={() => {
            setEditorOpen(false);
            setError("");
          }}
          onSubmit={(payload) => void handleSave(payload)}
          record={record}
          resource={resource}
          saving={saving}
          submitLabel={singleton ? "Save profile" : undefined}
        />
      )}
    </section>
  );
}
