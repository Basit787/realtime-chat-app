import { migrate } from "drizzle-orm/node-postgres/migrator";
import path from "node:path";
import { db } from "./client";

// Applies the SQL migrations drizzle-kit generated into src/drizzle/ (`pnpm db:generate`)
export async function runMigrations() {
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "src", "drizzle") });
}
