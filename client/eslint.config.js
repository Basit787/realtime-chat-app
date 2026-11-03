import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// TypeScript, React hooks and fast-refresh rules; formatting is left to Prettier
export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "src/routeTree.gen.ts"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  // Route files export only `Route`; the router plugin code-splits their components
  { files: ["src/routes/**"], rules: { "react-refresh/only-export-components": "off" } },
);
