import assert from "node:assert/strict";
import test from "node:test";
import { apiRequest, responseJson } from "./api-test-utils";

const publicEndpoints = [
  "/api/v1/projects?page=1&limit=1",
  "/api/v1/projects/featured",
  "/api/v1/skills",
  "/api/v1/experiences",
  "/api/v1/education",
  "/api/v1/achievements",
  "/api/v1/research",
  "/api/v1/certifications",
  "/api/v1/profile",
  "/api/v1/public/portfolio",
];

test("public API endpoints return successful response envelopes", async () => {
  const failures: string[] = [];
  for (const endpoint of publicEndpoints) {
    const response = await apiRequest(endpoint);
    if (response.status !== 200) {
      failures.push(`${endpoint} returned HTTP ${response.status}`);
      continue;
    }

    const body = await responseJson(response);
    if ((body as { success?: boolean }).success !== true) {
      failures.push(`${endpoint} did not return a successful API envelope`);
    }
  }
  assert.deepEqual(failures, []);
});

test("public contact endpoints reject invalid payloads", async () => {
  const endpoint = "/api/v1/public/messages";
  const response = await apiRequest(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.equal(response.status, 400, `${endpoint} returned HTTP ${response.status}`);
});
