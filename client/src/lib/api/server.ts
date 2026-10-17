import "server-only";

import { cookies } from "next/headers";
import {
  apiErrorFromResponse,
  apiInvalidResponseError,
  apiNetworkError,
  isApiEnvelope,
  type ApiEnvelope,
} from "@/types/api";

const API_BASE_URL = (process.env.API_BASE_URL ?? "http://localhost:5000").replace(
  /\/+$/,
  "",
);

type ServerApiOptions = RequestInit & {
  forwardCookies?: boolean;
};

export async function serverApiRequest<T>(
  path: string,
  options: ServerApiOptions = {},
): Promise<ApiEnvelope<T> | null> {
  const { forwardCookies = false, headers: initHeaders, ...init } = options;
  const headers = new Headers(initHeaders);
  if (forwardCookies) {
    const cookieHeader = (await cookies())
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");
    if (cookieHeader) headers.set("Cookie", cookieHeader);
  }

  let response: Response;
  try {
    response = await fetch(
      `${API_BASE_URL}/api/v1/${path.replace(/^\/+/, "")}`,
      { ...init, headers },
    );
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

export async function checkApiHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    cache: "no-store",
  });
  if (!response.ok) throw await apiErrorFromResponse(response);
  const payload: unknown = await response.json();
  if (
    !isApiEnvelope(
      payload,
      (data): data is { status: string } =>
        typeof data === "object" &&
        data !== null &&
        "status" in data &&
        typeof data.status === "string",
    )
  ) {
    throw apiInvalidResponseError();
  }
  return payload;
}
