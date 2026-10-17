"use client";

import Image from "next/image";
import { LoaderCircle, Upload, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { uploadImage } from "./admin-api";
import type { AdminField, AdminResource } from "./resources";

type FormValue = string | number | boolean;
type ResourceRecord = Record<string, unknown>;

function dateInputValue(value: unknown) {
  if (typeof value !== "string" || !value) return "";
  return value.slice(0, 10);
}

function getInitialValues(resource: AdminResource, record?: ResourceRecord) {
  const values: Record<string, FormValue> = {};
  for (const field of resource.fields) {
    const value = record?.[field.name];
    if (field.type === "checkbox") {
      values[field.name] = typeof value === "boolean" ? value : false;
    } else if (field.type === "select") {
      const selectedValue = typeof value === "string" ? value : "";
      values[field.name] = field.options?.some(
        (option) => option.value === selectedValue,
      )
        ? selectedValue
        : field.options?.[0]?.value ?? "";
    } else if (field.type === "date") {
      values[field.name] = dateInputValue(value);
    } else if (field.type === "tags") {
      values[field.name] = Array.isArray(value)
        ? value
            .map((item) => {
              if (typeof item === "string") return item;
              if (item && typeof item === "object" && "name" in item) {
                return String(item.name);
              }
              return "";
            })
            .filter(Boolean)
            .join(", ")
        : "";
    } else if (typeof value === "string" || typeof value === "number") {
      values[field.name] = value;
    } else {
      values[field.name] = "";
    }
    if (field.publicIdField) {
      const publicId = record?.[field.publicIdField];
      values[field.publicIdField] = typeof publicId === "string" ? publicId : "";
    }
  }
  return values;
}

function buildPayload(resource: AdminResource, values: Record<string, FormValue>) {
  const payload: Record<string, unknown> = {};
  for (const field of resource.fields) {
    const value = values[field.name];
    if (field.type === "checkbox") {
      payload[field.name] = Boolean(value);
    } else if (field.type === "number") {
      payload[field.name] = value === "" ? null : Number(value);
    } else if (field.type === "date") {
      payload[field.name] = value === "" ? null : value;
    } else if (field.type === "tags") {
      payload[field.name] =
        typeof value === "string"
          ? [...new Set(value.split(",").map((tag) => tag.trim()).filter(Boolean))]
          : [];
    } else if (field.type === "image") {
      payload[field.name] = value || null;
      if (field.publicIdField) {
        payload[field.publicIdField] = values[field.publicIdField] || null;
      }
    } else {
      payload[field.name] = value === "" ? null : value;
    }
  }
  const currentExperience = resource.key === "experience" && values.current === true;
  if (currentExperience) payload.endDate = null;
  return payload;
}

function inputClassName() {
  return "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";
}

function FieldControl({
  field,
  value,
  publicId,
  onChange,
  onPublicIdChange,
}: {
  field: AdminField;
  value: FormValue;
  publicId?: string;
  onChange: (value: FormValue) => void;
  onPublicIdChange: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  if (field.type === "checkbox") {
    return (
      <label className="flex min-h-11 items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700">
        <input
          checked={Boolean(value)}
          className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          onChange={(event) => onChange(event.currentTarget.checked)}
          type="checkbox"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "image") {
    const imageUrl = typeof value === "string" ? value : "";
    return (
      <div className="space-y-2">
        {imageUrl ? (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2">
            <Image
              alt={`${field.label} preview`}
              className="h-16 w-24 rounded-md object-cover"
              height={64}
              src={imageUrl}
              unoptimized
              width={96}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-slate-500">{field.label} uploaded</p>
              {publicId && <p className="truncate text-[11px] text-slate-400">{publicId}</p>}
            </div>
            <button
              aria-label={`Remove ${field.label.toLowerCase()}`}
              className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600"
              onClick={() => {
                onChange("");
                onPublicIdChange("");
              }}
              type="button"
            >
              <X aria-hidden="true" size={16} />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-5 text-sm font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-700">
            {uploading ? (
              <LoaderCircle aria-hidden="true" className="animate-spin" size={17} />
            ) : (
              <Upload aria-hidden="true" size={17} />
            )}
            {uploading ? "Uploading image…" : "Choose an image"}
            <input
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              disabled={uploading}
              onChange={async (event) => {
                const file = event.currentTarget.files?.[0];
                event.currentTarget.value = "";
                if (!file) return;
                setUploading(true);
                setUploadError("");
                try {
                  const uploaded = await uploadImage(
                    file,
                    field.uploadFolder ?? "portfolio/general",
                  );
                  onChange(uploaded.url);
                  onPublicIdChange(uploaded.publicId);
                } catch (cause) {
                  setUploadError(
                    cause instanceof Error ? cause.message : "Could not upload image.",
                  );
                } finally {
                  setUploading(false);
                }
              }}
              type="file"
            />
          </label>
        )}
        <p className="text-xs text-slate-500">JPEG, PNG, WebP, or AVIF · max 5 MB</p>
        {uploadError && <p className="text-xs text-red-600" role="alert">{uploadError}</p>}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <select
        className={inputClassName()}
        id={field.name}
        name={field.name}
        onChange={(event) => onChange(event.currentTarget.value)}
        value={String(value)}
      >
        {field.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  const commonProps = {
    className: inputClassName(),
    id: field.name,
    name: field.name,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => onChange(event.currentTarget.value),
    placeholder: field.type === "tags" ? "React, Next.js, TypeScript" : undefined,
    required: field.required,
    value: String(value),
  };

  if (field.type === "textarea") {
    return <textarea {...commonProps} className={`${commonProps.className} min-h-28 resize-y`} />;
  }

  return (
    <input
      {...commonProps}
      max={field.type === "number" ? 100 : undefined}
      min={field.type === "number" ? 0 : undefined}
      step={field.type === "number" ? 1 : undefined}
      type={field.type === "tags" ? "text" : field.type}
    />
  );
}

export function ResourceEditor({
  resource,
  record,
  saving = false,
  error,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  resource: AdminResource;
  record?: ResourceRecord;
  saving?: boolean;
  error?: string;
  submitLabel?: string;
  onCancel: () => void;
  onSubmit: (payload: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState(() => getInitialValues(resource, record));
  const isEdit = Boolean(record);

  function change(fieldName: string, value: FormValue) {
    setValues((current) => ({ ...current, [fieldName]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(buildPayload(resource, values));
  }

  return (
    <div
      aria-labelledby="resource-editor-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/45 p-3 sm:p-6"
      role="dialog"
    >
      <form
        className="my-auto w-full max-w-3xl rounded-2xl bg-white shadow-2xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900" id="resource-editor-title">
              {isEdit ? "Edit" : "New"} {resource.singular}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{resource.description}</p>
          </div>
          <button
            aria-label="Close editor"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            disabled={saving}
            onClick={onCancel}
            type="button"
          >
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6">
          {resource.fields.map((field) => (
            <div
              className={field.fullWidth || field.type === "image" ? "sm:col-span-2" : ""}
              key={field.name}
            >
              {field.type !== "checkbox" && (
                <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="ml-1 text-red-600">*</span>}
                </label>
              )}
              <FieldControl
                field={field}
                onChange={(value) => change(field.name, value)}
                onPublicIdChange={(value) => {
                  if (field.publicIdField) change(field.publicIdField, value);
                }}
                publicId={
                  field.publicIdField ? String(values[field.publicIdField] ?? "") : undefined
                }
                value={values[field.name] ?? ""}
              />
              {field.helpText && <p className="mt-1 text-xs text-slate-500">{field.helpText}</p>}
            </div>
          ))}
        </div>
        {error && (
          <p className="mx-5 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:mx-6" role="alert">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 sm:px-6">
          <button
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            disabled={saving}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving && <LoaderCircle aria-hidden="true" className="animate-spin" size={15} />}
            {saving ? "Saving…" : submitLabel ?? "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
