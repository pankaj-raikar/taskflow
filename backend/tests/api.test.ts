import { afterAll, beforeAll, describe, expect, test } from "bun:test";

process.env.JWT_SECRET = "test-secret";
process.env.FRONTEND_URL = "http://localhost:5173";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const integrationDescribe = testDatabaseUrl ? describe : describe.skip;

if (testDatabaseUrl) {
  process.env.DATABASE_URL = testDatabaseUrl;
}

const modules = testDatabaseUrl
  ? await Promise.all([import("../src/db/migrate"), import("../src/app"), import("../src/db")])
  : null;
const migrate = modules?.[0].migrate;
const app = modules?.[1].app;
const client = modules?.[2].client;

async function requestJson(path: string, init?: RequestInit) {
  if (!app) throw new Error("TEST_DATABASE_URL is required for API integration tests");

  const response = await app.request(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  return {
    status: response.status,
    body: await response.json()
  };
}

async function register(email = "alex@example.com") {
  const response = await requestJson("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Alex Morgan",
      email,
      password: "correct horse battery staple"
    })
  });

  expect(response.status).toBe(201);
  return response.body as {
    token: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar: string;
      bio: string;
      role: string;
      status: string;
    };
  };
}

beforeAll(async () => {
  await migrate?.();
});

afterAll(async () => {
  await client?.end();
});

integrationDescribe("auth", () => {
  test("registers a user and returns a bearer token plus frontend user shape", async () => {
    const { token, user } = await register("register@example.com");

    expect(token).toBeString();
    expect(user).toMatchObject({
      name: "Alex Morgan",
      email: "register@example.com",
      avatar: "",
      bio: "",
      role: "Member",
      status: "online"
    });
  });

  test("logs in with a registered email and password", async () => {
    await register("login@example.com");

    const response = await requestJson("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "login@example.com",
        password: "correct horse battery staple"
      })
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeString();
    expect(response.body.user.email).toBe("login@example.com");
  });

  test("rejects duplicate registration", async () => {
    await register("duplicate@example.com");

    const response = await requestJson("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Alex Morgan",
        email: "duplicate@example.com",
        password: "correct horse battery staple"
      })
    });

    expect(response).toMatchObject({
      status: 409,
      body: { error: "Email already registered" }
    });
  });
});

integrationDescribe("authenticated task routes", () => {
  test("creates, lists, updates, and deletes tasks scoped to the signed-in user", async () => {
    const { token, user } = await register("tasks@example.com");
    const auth = { authorization: `Bearer ${token}` };

    const created = await requestJson("/api/tasks", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        title: "Design landing page UI",
        description: "Create a high-fidelity landing page.",
        status: "todo",
        category: "Design",
        priority: "high",
        dueDate: "2026-05-28",
        assigneeId: user.id,
        starred: true
      })
    });

    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({
      title: "Design landing page UI",
      status: "todo",
      dateLabel: "Due Today",
      assigneeId: user.id,
      starred: true
    });

    const listed = await requestJson("/api/tasks", { headers: auth });
    expect(listed.status).toBe(200);
    expect(listed.body.data).toHaveLength(1);

    const taskId = created.body.data.id;
    const updated = await requestJson(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: auth,
      body: JSON.stringify({ status: "done", starred: false })
    });

    expect(updated.status).toBe(200);
    expect(updated.body.data).toMatchObject({
      status: "done",
      dateLabel: "Completed",
      starred: false
    });

    const deleted = await requestJson(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: auth
    });

    expect(deleted.status).toBe(200);
    expect(deleted.body.data.id).toBe(taskId);
  });

  test("stores a custom task category from other category input", async () => {
    const { token, user } = await register("custom-category@example.com");
    const auth = { authorization: `Bearer ${token}` };

    const created = await requestJson("/api/tasks", {
      method: "POST",
      headers: auth,
      body: JSON.stringify({
        title: "Coordinate launch batch",
        description: "Group the release tasks into small execution batches.",
        status: "in-progress",
        category: "Launch Ops",
        priority: "medium",
        dueDate: "2026-05-29",
        assigneeId: user.id,
        starred: false
      })
    });

    expect(created.status).toBe(201);
    expect(created.body.data.category).toBe("Launch Ops");

    const taskId = created.body.data.id;
    const updated = await requestJson(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: auth,
      body: JSON.stringify({ category: "Customer Research" })
    });

    expect(updated.status).toBe(200);
    expect(updated.body.data.category).toBe("Customer Research");

    const listed = await requestJson("/api/tasks", { headers: auth });
    expect(listed.status).toBe(200);
    expect(listed.body.data[0].category).toBe("Customer Research");
  });

  test("rejects protected routes without a bearer token", async () => {
    const response = await requestJson("/api/tasks");

    expect(response).toMatchObject({
      status: 401,
      body: { error: "Missing bearer token" }
    });
  });

  test("serves task routes from the Vercel service route prefix", async () => {
    const response = await requestJson("/_/backend/api/tasks");

    expect(response).toMatchObject({
      status: 401,
      body: { error: "Missing bearer token" }
    });
  });
});

integrationDescribe("authenticated user routes", () => {
  test("only returns the signed-in user from user endpoints", async () => {
    const hiddenUser = await register("hidden-user@example.com");
    const { token, user } = await register("visible-user@example.com");
    const auth = { authorization: `Bearer ${token}` };

    const listed = await requestJson("/api/users", { headers: auth });
    expect(listed.status).toBe(200);
    expect(listed.body.data).toHaveLength(1);
    expect(listed.body.data[0].email).toBe("visible-user@example.com");

    const hidden = await requestJson(`/api/users/${hiddenUser.user.id}`, { headers: auth });
    expect(hidden.status).toBe(404);

    const current = await requestJson(`/api/users/${user.id}`, { headers: auth });
    expect(current.status).toBe(200);
    expect(current.body.data.id).toBe(user.id);
  });
});
