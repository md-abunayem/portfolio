import assert from "node:assert/strict";
import test from "node:test";
import { apiRequest, responseJson } from "./api-test-utils";

test("frontend origin passes the API CORS preflight", async () => {
  const response = await apiRequest("/api/v1/auth/login", {
    method: "OPTIONS",
    headers: {
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "content-type",
    },
  });

  assert.equal(response.status, 204);
  assert.equal(
    response.headers.get("access-control-allow-origin"),
    "http://localhost:3000",
  );
  assert.equal(response.headers.get("access-control-allow-credentials"), "true");
});

test("API liveness and PostgreSQL readiness endpoints respond successfully", async () => {
  const liveness = await apiRequest("/api/health");
  assert.equal(liveness.status, 200);
  const livenessBody = await responseJson(liveness);
  assert.equal(
    (livenessBody as { data?: { status?: string } }).data?.status,
    "ok",
  );

  const readiness = await apiRequest("/api/health/ready");
  assert.equal(readiness.status, 200);
  const readinessBody = await responseJson(readiness);
  assert.equal(
    (readinessBody as { data?: { status?: string } }).data?.status,
    "ready",
  );
});
