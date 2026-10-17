import { createHash } from "node:crypto";

export const SESSION_COOKIE = "portfolio_session";

export const hashSessionToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
