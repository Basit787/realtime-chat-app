import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, type ProxyOptions } from "vite";

const PORT = 3000;
// The chat server; Docker sets API_PROXY_TARGET to the server container
const apiTarget = process.env.API_PROXY_TARGET || "http://127.0.0.1:3001";

// The server's /api (accounts and chat) and Socket.IO on the client's own origin, so its cookies are first-party
const proxy: Record<string, ProxyOptions> = {
  "/api": { target: apiTarget, changeOrigin: true },
  "/socket.io": { target: apiTarget, changeOrigin: true, ws: true },
};

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackRouter({ target: "react", autoCodeSplitting: true }), viteReact()],
  build: { target: "es2022" },
  server: {
    host: true,
    port: PORT,
    // Transform the entry and routes at startup so the first visit isn't compiled on demand
    warmup: { clientFiles: ["./src/main.tsx", "./src/routes/**/*.tsx"] },
    // File events don't reach Docker containers reliably on macOS
    watch: { usePolling: process.env.CHOKIDAR_USEPOLLING === "true" },
    proxy,
  },
  preview: { port: 80, host: true, proxy },
});
