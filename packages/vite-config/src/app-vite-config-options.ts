import type { ServiceName } from "ports";

export type AppViteConfigOptions = {
  // Dev and preview server port, from PORTS
  port: number;
  // Backend proxied at /api (prefix stripped); API_PROXY_TARGET overrides its URL
  api?: ServiceName;
  // Also proxy Socket.IO (/socket.io) to the backend
  websocket?: boolean;
};
