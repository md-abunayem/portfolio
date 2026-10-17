import {
  apiErrorFromResponse,
  apiInvalidResponseError,
  apiNetworkError,
  isApiEnvelope,
  type ApiEnvelope,
} from "@/types/api";

const API_PREFIX = "/api/v1";

type ApiRequestOptions = Omit<RequestInit, "body" | "credentials"> & {
  body?: BodyInit | object | null;
};

function isFormData(body: BodyInit | object | null | undefined): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function isBodyInit(body: BodyInit | object | null | undefined): body is BodyInit {
  if (body === null || body === undefined || typeof body !== "object") return false;
  return (
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body) ||
    typeof ReadableStream !== "undefined" && body instanceof ReadableStream
  );
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiEnvelope<T> | null> {
  const headers = new Headers(options.headers);
  let body: BodyInit | null | undefined;

  if (options.body === null || options.body === undefined) {
    body = options.body;
  } else if (isFormData(options.body) || isBodyInit(options.body)) {
    body = options.body;
  } else {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  let response: Response;
  try {
    response = await fetch(`${API_PREFIX}/${path.replace(/^\/+/, "")}`, {
      ...options,
      body,
      credentials: "include",
      headers,
    });
  } catch (error) {
    throw apiNetworkError(error);
  }

  if (!response.ok) throw await apiErrorFromResponse(response);
  if (response.status === 204) return null;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (error) {
    throw apiInvalidResponseError(error);
  }
  if (!isApiEnvelope<T>(payload)) {
    throw apiInvalidResponseError();
  }

  return payload;
}
