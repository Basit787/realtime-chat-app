// Port of every application in the workspace; Docker compose files repeat these numbers
export const PORTS = {
  auth: 3005,
  chatAppBackend: 3004,
  chatAppFrontend: 5176,
  home: 5177,
  linkShortener: 5178,
} as const;

export type ServiceName = keyof typeof PORTS;

export const LOCALHOST = "localhost";

// Host the page was opened from (localhost, a LAN IP such as 192.168.0.1, ...); localhost outside a browser
export const currentHostname = (): string =>
  typeof window === "undefined" ? LOCALHOST : window.location.hostname || LOCALHOST;

type ServiceUrlOptions = { hostname?: string; protocol?: "http" | "https" };

// URL of a service on the same host as the current page, e.g. http://192.168.0.1:5176
export const serviceUrl = (
  name: ServiceName,
  { hostname = currentHostname(), protocol = "http" }: ServiceUrlOptions = {},
) => `${protocol}://${hostname}:${PORTS[name]}`;

// Origins of the web apps on localhost, the default CORS allow-list of the APIs
export const localAppOrigins = (): string[] =>
  (["chatAppFrontend", "home", "linkShortener"] as const).flatMap((app) => [
    serviceUrl(app, { hostname: LOCALHOST }),
    serviceUrl(app, { hostname: LOCALHOST, protocol: "https" }),
  ]);
