import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { apiRequest, apiUrl, clientOrigin, responseJson } from "./api-test-utils";

const adminCollections = [
  "/api/v1/admin/projects",
  "/api/v1/admin/skills",
  "/api/v1/admin/experiences",
  "/api/v1/admin/education",
  "/api/v1/admin/achievements",
  "/api/v1/admin/research",
  "/api/v1/admin/certifications",
  "/api/v1/admin/profile",
  "/api/v1/admin/messages",
];

const crudResources = [
  {
    path: "/api/v1/admin/projects",
    create: (token: string) => ({
      title: `API test project ${token}`,
      slug: `api-test-project-${token}`,
      description: "Created by an API integration test.",
      technologies: ["API test"],
    }),
    field: "description",
    updatedValue: "Updated by an API integration test.",
    publicSlug: (token: string) => `api-test-project-${token}`,
  },
  {
    path: "/api/v1/admin/skills",
    create: (token: string) => ({
      name: `API test skill ${token}`,
      category: "API integration",
      level: 40,
    }),
    field: "level",
    updatedValue: 73,
  },
  {
    path: "/api/v1/admin/experiences",
    create: (token: string) => ({
      company: `API test company ${token}`,
      position: "Integration tester",
      description: "Created by an API integration test.",
      startDate: "2020-01-01",
      current: true,
    }),
    field: "position",
    updatedValue: "Updated integration tester",
  },
  {
    path: "/api/v1/admin/education",
    create: (token: string) => ({
      institution: `API test institution ${token}`,
      degree: "Integration test degree",
      startDate: "2020-01-01",
    }),
    field: "degree",
    updatedValue: "Updated integration test degree",
  },
  {
    path: "/api/v1/admin/achievements",
    create: (token: string) => ({
      title: `API test achievement ${token}`,
      description: "Created by an API integration test.",
    }),
    field: "title",
    updatedValue: "Updated API test achievement",
  },
  {
    path: "/api/v1/admin/research",
    create: (token: string) => ({
      title: `API test research ${token}`,
      description: "Created by an API integration test.",
    }),
    field: "title",
    updatedValue: "Updated API test research",
  },
  {
    path: "/api/v1/admin/certifications",
    create: (token: string) => ({ title: `API test certification ${token}` }),
    field: "title",
    updatedValue: "Updated API test certification",
  },
];

function authenticatedRequest(
  path: string,
  cookie: string,
  options: RequestInit = {},
) {
  const headers = new Headers(options.headers);
  headers.set("Cookie", cookie);
  headers.set("Origin", clientOrigin);
  return fetch(apiUrl(path), { ...options, headers });
}

async function sendJson(
  path: string,
  cookie: string,
  method: string,
  body: unknown,
) {
  return authenticatedRequest(path, cookie, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function envelopeData(body: unknown): unknown {
  assert.ok(typeof body === "object" && body !== null && "data" in body);
  return body.data;
}

test("administrator login grants access to protected reads and logout revokes the session", async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  assert.ok(email && password, "Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env to run API tests.");

  const unauthorized = await apiRequest("/api/v1/auth/me");
  assert.equal(unauthorized.status, 401);

  const login = await apiRequest("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(login.status, 200, `Administrator login returned HTTP ${login.status}`);
  const loginBody = await responseJson(login);
  assert.equal((loginBody as { success?: boolean }).success, true);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie, "Administrator login did not issue a session cookie.");

  const createdRecords: Array<{ path: string; id: string }> = [];
  let testMessageId: string | undefined;
  let testMessageDeleted = false;
  try {
    const currentAdmin = await authenticatedRequest("/api/v1/auth/me", cookie);
    assert.equal(currentAdmin.status, 200);

    const adminReadFailures: string[] = [];
    for (const endpoint of adminCollections) {
      const response = await authenticatedRequest(endpoint, cookie);
      if (response.status !== 200) {
        adminReadFailures.push(`${endpoint} returned HTTP ${response.status}`);
        continue;
      }
      const body = await responseJson(response);
      if ((body as { success?: boolean }).success !== true) {
        adminReadFailures.push(`${endpoint} did not return a successful API envelope`);
      }
    }
    assert.deepEqual(adminReadFailures, []);

    const profileUpdate = await sendJson(
      "/api/v1/admin/profile",
      cookie,
      "PATCH",
      {},
    );
    assert.equal(profileUpdate.status, 400, "Empty profile update should be rejected.");

    const passwordUpdate = await sendJson(
      "/api/v1/auth/password",
      cookie,
      "PATCH",
      {},
    );
    assert.equal(passwordUpdate.status, 400, "Empty password update should be rejected.");

    const token = randomUUID().replaceAll("-", "");
    for (const resource of crudResources) {
      const create = await sendJson(resource.path, cookie, "POST", resource.create(token));
      assert.equal(create.status, 201, `${resource.path} create returned HTTP ${create.status}`);
      const createBody = await responseJson(create);
      const created = envelopeData(createBody);
      assert.ok(typeof created === "object" && created !== null && "id" in created);
      const id = (created as { id: unknown }).id;
      assert.equal(typeof id, "string");
      createdRecords.push({ path: resource.path, id });

      const list = await authenticatedRequest(`${resource.path}?page=1&pageSize=100`, cookie);
      assert.equal(list.status, 200, `${resource.path} list returned HTTP ${list.status}`);
      const listBody = await responseJson(list);
      const listData = envelopeData(listBody);
      assert.ok(
        typeof listData === "object" &&
          listData !== null &&
          "items" in listData &&
          Array.isArray(listData.items) &&
          listData.items.some((item: { id?: string }) => item.id === id),
        `${resource.path} did not list the newly created record.`,
      );

      const detail = await authenticatedRequest(`${resource.path}/${id}`, cookie);
      assert.equal(detail.status, 200, `${resource.path} detail returned HTTP ${detail.status}`);

      const update = await sendJson(
        `${resource.path}/${id}`,
        cookie,
        "PATCH",
        { [resource.field]: resource.updatedValue },
      );
      assert.equal(update.status, 200, `${resource.path} update returned HTTP ${update.status}`);
      const updateBody = await responseJson(update);
      const updated = envelopeData(updateBody);
      assert.equal(
        (updated as Record<string, unknown>)[resource.field],
        resource.updatedValue,
        `${resource.path} update was not persisted.`,
      );

      if ("publicSlug" in resource) {
        const hiddenDraft = await apiRequest(
          `/api/v1/projects/${resource.publicSlug(token)}`,
        );
        assert.equal(hiddenDraft.status, 404, "Draft projects must not be publicly visible.");
      }

      const remove = await authenticatedRequest(`${resource.path}/${id}`, cookie, {
        method: "DELETE",
      });
      assert.equal(remove.status, 204, `${resource.path} delete returned HTTP ${remove.status}`);
      createdRecords.pop();
    }

    const contact = await apiRequest("/api/v1/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "API integration test",
        email: `api-test-${token}@example.invalid`,
        subject: "Temporary API integration test",
        message: `Temporary API integration test ${token}`,
      }),
    });
    assert.equal(contact.status, 201, `Contact submission returned HTTP ${contact.status}`);
    const contactBody = await responseJson(contact);
    const contactData = envelopeData(contactBody);
    assert.ok(typeof contactData === "object" && contactData !== null && "id" in contactData);
    testMessageId = (contactData as { id: string }).id;

    const messages = await authenticatedRequest("/api/v1/admin/messages?page=1&pageSize=100", cookie);
    assert.equal(messages.status, 200);
    const messagesData = envelopeData(await responseJson(messages));
    assert.ok(typeof messagesData === "object" && messagesData !== null && "items" in messagesData);
    assert.ok(
      Array.isArray(messagesData.items) &&
        messagesData.items.some((item: { id?: string }) => item.id === testMessageId),
      "The submitted contact message was not persisted to the administrator inbox.",
    );

    const messageDetail = await authenticatedRequest(
      `/api/v1/admin/messages/${testMessageId}`,
      cookie,
    );
    assert.equal(messageDetail.status, 200);

    const messageStatus = await sendJson(
      `/api/v1/admin/messages/${testMessageId}/status`,
      cookie,
      "PATCH",
      { status: "READ" },
    );
    assert.equal(messageStatus.status, 200);

    const legacyMessageStatus = await sendJson(
      `/api/v1/admin/messages/${testMessageId}`,
      cookie,
      "PATCH",
      { status: "REPLIED" },
    );
    assert.equal(legacyMessageStatus.status, 200);

    const removeMessage = await authenticatedRequest(
      `/api/v1/admin/messages/${testMessageId}`,
      cookie,
      { method: "DELETE" },
    );
    assert.equal(removeMessage.status, 204);
    testMessageDeleted = true;

    for (const endpoint of [
      "/api/v1/admin/uploads/image",
      "/api/v1/admin/uploads/images",
    ]) {
      const emptyUpload = await authenticatedRequest(endpoint, cookie, {
        method: "POST",
        body: new FormData(),
      });
      assert.equal(emptyUpload.status, 400, `${endpoint} should reject an empty upload.`);
    }

    const invalidDeleteUpload = await sendJson(
      "/api/v1/admin/uploads/image",
      cookie,
      "DELETE",
      {},
    );
    assert.equal(invalidDeleteUpload.status, 400);
  } finally {
    for (const record of createdRecords.reverse()) {
      const cleanup = await authenticatedRequest(`${record.path}/${record.id}`, cookie, {
        method: "DELETE",
      });
      assert.ok(
        cleanup.status === 204 || cleanup.status === 404,
        `Cleanup for ${record.path}/${record.id} returned HTTP ${cleanup.status}`,
      );
    }

    if (testMessageId && !testMessageDeleted) {
      const cleanup = await authenticatedRequest(
        `/api/v1/admin/messages/${testMessageId}`,
        cookie,
        { method: "DELETE" },
      );
      assert.ok(
        cleanup.status === 204 || cleanup.status === 404,
        `Contact-message cleanup returned HTTP ${cleanup.status}`,
      );
    }

    const logout = await authenticatedRequest("/api/v1/auth/logout", cookie, {
      method: "POST",
    });
    assert.equal(logout.status, 200, `Administrator logout returned HTTP ${logout.status}`);
  }
});
