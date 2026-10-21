// Port of every application in the workspace; Docker compose files repeat these numbers
export const PORTS = {
  auth: 3001,
  // Chat's UI moved off 3002: browsers that opened chat while it ran HTTPS cached a permanent redirect for it
  chatAppBackend: 3002,
  chatAppFrontend: 3003,
  home: 3000,
  linkShortener: 3004,
  imageUploadBackend: 3006,
  imageUploadFrontend: 3005,
} as const;

export type ServiceName = keyof typeof PORTS;

// Path of each service once deployed behind one HTTPS domain, e.g. https://myapp.com/chat
export const APP_PATHS: Record<ServiceName, string> = {
  home: "/",
  auth: "/auth",
  chatAppFrontend: "/chat",
  chatAppBackend: "/chat-api",
  linkShortener: "/links",
  imageUploadFrontend: "/images",
  imageUploadBackend: "/images-api",
};

export const LOCALHOST = "localhost";

// Host the page was opened from (localhost, a LAN IP such as 192.168.0.1, ...); localhost outside a browser
export const currentHostname = (): string =>
  typeof window === "undefined" ? LOCALHOST : window.location.hostname || LOCALHOST;

// Deployed: the page is on an HTTPS domain without a port (https://myapp.com/...); local dev and `make prod` use host:port
export const isDeployed = (): boolean =>
  typeof window !== "undefined" && window.location.protocol === "https:" && window.location.port === "";

type ServiceUrlOptions = { hostname?: string; protocol?: "http" | "https" };

// Local: http://<current host>:<port> (localhost or a LAN IP). Deployed: <current origin><app path>.
// An explicit hostname/protocol (server-side configs) always gives host:port.
export const serviceUrl = (name: ServiceName, { hostname, protocol }: ServiceUrlOptions = {}) => {
  if (!hostname && !protocol && isDeployed()) return `${window.location.origin}${APP_PATHS[name]}`;
  return `${protocol ?? "http"}://${hostname ?? currentHostname()}:${PORTS[name]}`;
};

// Origins of the web apps on localhost, the default CORS allow-list of the APIs
export const localAppOrigins = (): string[] =>
  (["chatAppFrontend", "home", "linkShortener", "imageUploadFrontend"] as const).flatMap((app) => [
    serviceUrl(app, { hostname: LOCALHOST }),
    serviceUrl(app, { hostname: LOCALHOST, protocol: "https" }),
  ]);
