import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm"],
  // tsup sets `baseUrl` for the declaration build, which TypeScript 6 flags as deprecated
  dts: { compilerOptions: { ignoreDeprecations: "6.0" } },
  sourcemap: true,
  clean: !options.watch,
  treeshake: true,
}));
