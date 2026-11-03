import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

// TypeScript rules; formatting is left to Prettier
export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  // `declare global` namespaces in .d.ts files
  { files: ["**/*.d.ts"], rules: { "@typescript-eslint/no-namespace": "off" } },
);
