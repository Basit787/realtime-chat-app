import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "src/prisma/schema.prisma",
  migrations: { path: "src/prisma/migrations" },
  datasource: { url: process.env.DATABASE_URL || "postgres://postgres:postgres@127.0.0.1:5433/image_upload" },
});
