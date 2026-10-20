import { defineConfig, globalIgnores } from "eslint/config";
import prettier from "eslint-config-prettier";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Next.js apps: Next's core-web-vitals + TypeScript rules, formatting left to Prettier
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  { rules: { "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }] } },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "drizzle/**"]),
]);
