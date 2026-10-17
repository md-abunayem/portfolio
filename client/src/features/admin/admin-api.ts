import { apiRequest } from "@/lib/api/client";
import type { AdminUser } from "@/types/portfolio";
import type { PaginatedData } from "@/types/api";
import type { ContactMessage, UploadedImage } from "@/types/portfolio";
import { ApiError, apiInvalidResponseError } from "@/types/api";

export async function adminRequest<T>(
  path: string,
  options: Parameters<typeof apiRequest<T>>[1] = {},
): Promise<T> {
  const response = await apiRequest<T>(path, options);
  if (!response) throw apiInvalidResponseError();
  return response.data;
}

export async function adminMutation(
  path: string,
  options: Parameters<typeof apiRequest>[1] = {},
): Promise<void> {
  await apiRequest(path, options);
}

export const getCurrentAdmin = () => adminRequest<AdminUser>("auth/me");

export const signIn = (email: string, password: string) =>
  adminRequest<AdminUser>("auth/login", {
    method: "POST",
    body: { email, password },
  });

export const signOut = () =>
  adminMutation("auth/logout", { method: "POST" });

export async function getCollectionPage<T>(
  path: string,
  page = 1,
  pageSize = 100,
): Promise<PaginatedData<T>> {
  return adminRequest<PaginatedData<T>>(
    `admin/${path}?page=${page}&pageSize=${pageSize}`,
  );
}

export function getRecentMessages(pageSize = 5) {
  return adminRequest<PaginatedData<ContactMessage>>(
    `admin/messages?page=1&pageSize=${pageSize}`,
  );
}

export function getUnreadMessageCount() {
  return adminRequest<PaginatedData<ContactMessage>>(
    "admin/messages?page=1&pageSize=1&status=UNREAD",
  ).then((result) => result.total);
}

export function updateMessageStatus(id: string, status: ContactMessage["status"]) {
  return adminRequest<ContactMessage>(`admin/messages/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: { status },
  });
}

export function deleteMessage(id: string) {
  return adminMutation(`admin/messages/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function uploadImage(file: File, folder: string) {
  const body = new FormData();
  body.set("image", file);
  body.set("folder", folder);
  return adminRequest<UploadedImage>("admin/uploads/image", {
    method: "POST",
    body,
  });
}

export async function loadProfile<T>() {
  return adminRequest<T>("admin/profile");
}

export async function saveProfile<T>(data: Record<string, unknown>) {
  const response = await apiRequest<T>("admin/profile", {
    method: "PATCH",
    body: data,
  });
  if (!response) throw apiInvalidResponseError();
  const result = response.data;
  if (result && typeof result === "object" && "profile" in result) {
    return (result as { profile: T }).profile;
  }
  return result;
}

export async function saveRecord<T>(
  path: string,
  data: Record<string, unknown>,
  id?: string,
) {
  return adminRequest<T>(
    id ? `${path}/${encodeURIComponent(id)}` : path,
    { method: id ? "PATCH" : "POST", body: data },
  );
}

export async function removeRecord(path: string, id: string) {
  await adminMutation(`${path}/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.code === "unauthorized";
}
