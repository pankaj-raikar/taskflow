import { describe, expect, test } from "bun:test";
import { createTaskSchema } from "../src/validators/tasks";

describe("task validators", () => {
  test("accepts custom category strings for user-defined categories", () => {
    const result = createTaskSchema.safeParse({
      title: "Plan launch batch",
      description: "Group rollout tasks into small batches.",
      status: "todo",
      category: "Launch Ops",
      priority: "medium",
      dueDate: "2026-05-29",
      assigneeId: "8eaf0c70-4a76-4b70-895c-9c20cc5d1783",
      starred: false
    });

    expect(result.success).toBe(true);
  });
});
