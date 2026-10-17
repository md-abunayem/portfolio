import "dotenv/config";

export const apiBaseUrl = (
  process.env.API_BASE_URL ?? "http://localhost:5000"
).replace(/\/+$/, "");
export const clientOrigin = "http://localhost:3000";

export function apiUrl(path: string) {
  return `${apiBaseUrl}${path}`;
}

export async function apiRequest(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set("Origin", clientOrigin);
  return fetch(apiUrl(path), { ...options, headers });
}

export async function responseJson(response: Response): Promise<unknown> {
  return response.json();
}
