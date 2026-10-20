import { defineConfig, type Plugin } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import type { Socket } from "node:net";
import { PORTS, serviceUrl } from "ports";

const apiTarget = process.env.API_PROXY_TARGET || serviceUrl("chatAppBackend", { hostname: "127.0.0.1" });
const authTarget = process.env.AUTH_PROXY_TARGET || serviceUrl("auth", { hostname: "127.0.0.1" });
// Browsers only expose camera/microphone on HTTPS (or localhost), so phones on the LAN need HTTPS for calls
const devHttps = process.env.DEV_HTTPS === "true";

const TLS_HANDSHAKE = 0x16;

// Phones type "<ip>:<port>" as http://; plain-HTTP connections get a redirect to https://
const redirectHttpToHttps = (): Plugin => ({
  name: "redirect-http-to-https",
  configureServer(server) {
    const httpServer = server.httpServer;
    if (!httpServer) return;
    const [tlsListener] = httpServer.listeners("connection") as ((socket: Socket) => void)[];
    if (!tlsListener) return;

    httpServer.removeListener("connection", tlsListener);
    httpServer.on("connection", (socket: Socket) => {
      socket.once("data", (chunk: Buffer) => {
        socket.pause();
        socket.unshift(chunk);
        if (chunk[0] === TLS_HANDSHAKE) {
          tlsListener.call(httpServer, socket);
          return;
        }
        const head = chunk.toString("latin1");
        const host = /^host:\s*(\S+)/im.exec(head)?.[1] ?? `localhost:${server.config.server.port}`;
        const url = /^[A-Z]+ (\S+)/.exec(head)?.[1] ?? "/";
        socket.end(
          `HTTP/1.1 301 Moved Permanently\r\nLocation: https://${host}${url}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`,
        );
      });
    });
  },
});

// Chat API at /api, the auth service at /auth-api (same origin, so its session cookie is first-party)
const proxy = {
  "/api": { target: apiTarget, changeOrigin: true, rewrite: (p: string) => p.replace(/^\/api/, "") },
  "/socket.io": { target: apiTarget, changeOrigin: true, ws: true },
  "/auth-api": { target: authTarget, changeOrigin: true, rewrite: (p: string) => p.replace(/^\/auth-api/, "/api") },
};

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    viteReact(),
    ...(devHttps ? [basicSsl(), redirectHttpToHttps()] : []),
  ],
  build: { target: "es2022" },
  server: {
    host: true,
    port: PORTS.chatAppFrontend,
    watch: { usePolling: process.env.CHOKIDAR_USEPOLLING === "true" },
    proxy,
  },
  preview: { port: 80, host: true, proxy },
});
