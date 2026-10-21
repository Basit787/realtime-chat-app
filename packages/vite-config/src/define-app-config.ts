import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { serviceUrl } from "ports";
import { defineConfig, type ProxyOptions } from "vite";
import type { AppViteConfigOptions } from "./app-vite-config-options.js";

const LOOPBACK = "127.0.0.1";

// Vite config every web app shares: React, TanStack Router, Tailwind, the /auth-api proxy and an optional /api backend
export const defineAppConfig = ({ port, api, websocket }: AppViteConfigOptions) => {
  const authTarget = process.env.AUTH_PROXY_TARGET || serviceUrl("auth", { hostname: LOOPBACK });
  const proxy: Record<string, ProxyOptions> = {
    // The auth service on the app's own origin, so its cookies are first-party
    "/auth-api": { target: authTarget, changeOrigin: true, rewrite: (p) => p.replace(/^\/auth-api/, "/api") },
  };
  if (api) {
    const apiTarget = process.env.API_PROXY_TARGET || serviceUrl(api, { hostname: LOOPBACK });
    proxy["/api"] = { target: apiTarget, changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, "") };
    if (websocket) proxy["/socket.io"] = { target: apiTarget, changeOrigin: true, ws: true };
  }

  return defineConfig({
    resolve: { tsconfigPaths: true },
    plugins: [devtools(), tailwindcss(), tanstackRouter({ target: "react", autoCodeSplitting: true }), viteReact()],
    build: { target: "es2022" },
    server: {
      host: true,
      port,
      // Transform the entry and routes at startup so the first visit isn't compiled on demand
      warmup: { clientFiles: ["./src/main.tsx", "./src/routes/**/*.tsx"] },
      // File events don't reach Docker containers reliably on macOS
      watch: { usePolling: process.env.CHOKIDAR_USEPOLLING === "true" },
      proxy,
    },
    preview: { port: 80, host: true, proxy },
  });
};
