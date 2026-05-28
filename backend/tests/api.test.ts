import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, unlinkSync } from "node:fs";
import { join } from "node:path";

process.env.JWT_SECRET = "test-secret";
process.env.DATABASE_URL = join(import.meta.dir, "test.db");
process.env.FRONTEND_URL = "http://localhost:5173";

const dbPath = process.env.DATABASE_URL;

if (existsSync(dbPath)) {
  unlinkSync(dbPath);
}

const { migrate } = await import("../src/db/migrate");
const { app } = await import("../src/app");

async function requestJson(path: string, init?: RequestInit) {
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
  await migrate();
});

afterAll(() => {
  if (existsSync(dbPath)) {
    unlinkSync(dbPath);
  }
});

describe("auth", () => {
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

describe("authenticated task routes", () => {
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

  test("rejects protected routes without a bearer token", async () => {
    const response = await requestJson("/api/tasks");

    expect(response).toMatchObject({
      status: 401,
      body: { error: "Missing bearer token" }
    });
  });
});
