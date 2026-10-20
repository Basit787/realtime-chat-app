// Runs once when the server starts: bring the database schema up to date
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { runMigrations } = await import("./lib/db/migrate");
  try {
    await runMigrations();
    console.log("Database migrations are up to date");
  } catch (error) {
    console.error("Database migrations failed; is PostgreSQL running (DATABASE_URL)?", error);
  }
}
