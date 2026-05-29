import { migrate as runMigrations } from "drizzle-orm/postgres-js/migrator";
import { client, db } from "./index";
import { join } from "path";

export async function migrate() {
  await runMigrations(db, {
    migrationsFolder: join(import.meta.dirname, "../../drizzle/migrations")
  });
}

if (import.meta.main) {
  await migrate();
  await client.end();
  console.log("Database migrations applied.");
}