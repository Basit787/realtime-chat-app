import { defineConfig } from "tsup";

export default defineConfig((options) => ({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  // Wiping dist on every watch rebuild would briefly break the app importing it
  clean: !options.watch,
  treeshake: true,
  // Ship the stylesheet next to the JS so its `@source "./"` scans the built components
  onSuccess: "cp src/styles.css dist/styles.css",
}));
