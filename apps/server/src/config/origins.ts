import { config } from "./index.js";

// localhost, loopback, RFC1918 private ranges and mDNS (*.local) hostnames
const PRIVATE_HOSTNAME =
  /^(localhost|127(\.\d{1,3}){3}|10(\.\d{1,3}){3}|192\.168(\.\d{1,3}){2}|172\.(1[6-9]|2\d|3[01])(\.\d{1,3}){2}|[\w-]+\.local)$/;

const isPrivateNetworkOrigin = (origin: string): boolean => {
  try {
    return PRIVATE_HOSTNAME.test(new URL(origin).hostname);
  } catch {
    return false;
  }
};

/** Explicit CORS_ORIGIN entries, plus any LAN origin when ALLOW_LAN_ORIGINS is enabled (so phones on the same Wi-Fi can connect). */
export const isAllowedOrigin = (origin: string): boolean =>
  config.corsOrigin.includes(origin) || (config.allowLanOrigins && isPrivateNetworkOrigin(origin));

/** Origin callback for the `cors` package (used by Express and Socket.IO). Requests without an Origin header are allowed. */
export const corsOriginCallback = (
  origin: string | undefined,
  callback: (err: Error | null, allow?: boolean) => void,
) => callback(null, !origin || isAllowedOrigin(origin));
