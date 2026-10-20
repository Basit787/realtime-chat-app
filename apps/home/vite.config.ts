import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { PORTS, serviceUrl } from "ports";

const authTarget = process.env.AUTH_PROXY_TARGET || serviceUrl("auth", { hostname: "127.0.0.1" });

// The auth service at /auth-api (same origin, so its session cookie is first-party and shared with the apps)
const proxy = {
  "/auth-api": { target: authTarget, changeOrigin: true, rewrite: (p: string) => p.replace(/^\/auth-api/, "/api") },
};

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackRouter({ target: "react", autoCodeSplitting: true }), viteReact()],
  build: { target: "es2022" },
  server: {
    host: true,
    port: PORTS.home,
    watch: { usePolling: process.env.CHOKIDAR_USEPOLLING === "true" },
    proxy,
  },
  preview: { port: 80, host: true, proxy },
});
