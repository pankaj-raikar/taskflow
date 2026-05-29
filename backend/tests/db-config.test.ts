import { describe, expect, test } from "bun:test";
import { getDatabaseUrl } from "../src/db/config";

describe("database config", () => {
  test("uses explicit DATABASE_URL when provided", () => {
    expect(getDatabaseUrl({ DATABASE_URL: "/custom/path.db" })).toBe("/custom/path.db");
  });

  test("uses writable tmp sqlite path on Vercel when no database URL is configured", () => {
    expect(getDatabaseUrl({ VERCEL: "1" })).toBe("/tmp/taskflow.db");
  });

  test("uses local dev database outside Vercel", () => {
    expect(getDatabaseUrl({})).toBe("./dev.db");
  });
});
