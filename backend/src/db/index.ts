import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";
import { bootstrapSqliteSchema } from "./bootstrap";
import { getDatabaseUrl } from "./config";

const databaseUrl = getDatabaseUrl();

export const sqlite = new Database(databaseUrl);
sqlite.exec("PRAGMA foreign_keys = ON");

if (process.env.VERCEL && !process.env.DATABASE_URL) {
  bootstrapSqliteSchema(sqlite);
}

export const db = drizzle(sqlite, { schema });
