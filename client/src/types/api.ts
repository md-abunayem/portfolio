export type ApiEnvelope<T> = {
  statusCode: number;
  success: true;
  data: T;
  message: string;
};

export type ApiNoContent = {
  statusCode: 204;
  success: true;
  data: null;
  message: "No content";
};

export type ApiErrorEnvelope = {
  statusCode: number;
  success: false;
  data: null;
  message: string;
  errors: unknown;
};

export type PaginatedData<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type ProjectListData<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ApiErrorCode =
  | "validation"
  | "unauthorized"
  | "forbidden"
  | "not-found"
  | "rate-limited"
  | "server"
  | "http"
  | "network"
  | "invalid-response";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number | null;
  readonly errors: unknown;

  constructor(
    message: string,
    options: {
      code: ApiErrorCode;
      status?: number | null;
      errors?: unknown;
      cause?: unknown;
    },
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status ?? null;
    this.errors = options.errors ?? [];
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function errorCodeForStatus(status: number): ApiErrorCode {
  if (status === 400) return "validation";
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not-found";
  if (status === 429) return "rate-limited";
  if (status >= 500) return "server";
  return "http";
}

export async function apiErrorFromResponse(response: Response): Promise<ApiError> {
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  const message =
    isRecord(payload) && typeof payload.message === "string"
      ? payload.message
      : `The request failed with HTTP ${response.status}.`;
  const errors = isRecord(payload) ? payload.errors : [];

  return new ApiError(message, {
    code: errorCodeForStatus(response.status),
    status: response.status,
    errors,
  });
}

export function apiNetworkError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  return new ApiError("Unable to reach the portfolio API. Check your connection and try again.", {
    code: "network",
    cause: error,
  });
}

export function apiInvalidResponseError(cause?: unknown): ApiError {
  return new ApiError("The portfolio API returned an invalid response.", {
    code: "invalid-response",
    cause,
  });
}

export function isApiEnvelope<T>(
  payload: unknown,
  isData?: (data: unknown) => data is T,
): payload is ApiEnvelope<T> {
  return (
    isRecord(payload) &&
    payload.success === true &&
    typeof payload.statusCode === "number" &&
    typeof payload.message === "string" &&
    "data" in payload &&
    (isData === undefined || isData(payload.data))
  );
}
