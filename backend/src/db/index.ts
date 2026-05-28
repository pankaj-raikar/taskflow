import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL ?? "./dev.db";

export const sqlite = new Database(databaseUrl);
sqlite.exec("PRAGMA foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
