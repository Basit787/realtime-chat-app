import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import type { Socket } from "net";
import path from "path";

const apiTarget = process.env.API_PROXY_TARGET || "http://127.0.0.1:3004";
// Browsers only expose camera/microphone on HTTPS (or localhost), so phones on the LAN need HTTPS for calls and voice notes
const devHttps = process.env.DEV_HTTPS === "true";

const TLS_HANDSHAKE = 0x16;

/**
 * Phones default to http:// when you type "<ip>:5176", which an HTTPS-only server just drops.
 * Sniff the first byte of each connection: TLS goes on to Vite, plain HTTP gets a redirect to https://.
 */
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
        socket.end(`HTTP/1.1 301 Moved Permanently\r\nLocation: https://${host}${url}\r\nConnection: close\r\nContent-Length: 0\r\n\r\n`);
      });
    });
  },
});

const proxy = {
  "/api": {
    target: apiTarget,
    changeOrigin: true,
    rewrite: (p: string) => p.replace(/^\/api/, ""),
  },
  "/socket.io": {
    target: apiTarget,
    changeOrigin: true,
    ws: true,
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss(), ...(devHttps ? [basicSsl(), redirectHttpToHttps()] : [])],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  build: { target: "es2022" },
  server: {
    host: true,
    port: 5176,
    watch: {
      usePolling: process.env.CHOKIDAR_USEPOLLING === "true",
    },
    proxy,
  },
  preview: {
    port: 80,
    host: true,
    proxy,
  },
});
