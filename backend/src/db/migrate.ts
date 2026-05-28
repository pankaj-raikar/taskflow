import { migrate as runMigrations } from "drizzle-orm/bun-sqlite/migrator";
import { db, sqlite } from "./index";

export async function migrate() {
  runMigrations(db, { migrationsFolder: "drizzle/migrations" });
}

if (import.meta.main) {
  await migrate();
  sqlite.close();
  console.log("Database migrations applied.");
}
