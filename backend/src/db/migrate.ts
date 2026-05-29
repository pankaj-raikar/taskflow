import { migrate as runMigrations } from "drizzle-orm/postgres-js/migrator";
import { client, db } from "./index";

export async function migrate() {
  runMigrations(db, { migrationsFolder: "drizzle/migrations" });
}

if (import.meta.main) {
  await migrate();
  await client.end();
  console.log("Database migrations applied.");
}
