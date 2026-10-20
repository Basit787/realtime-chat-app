import type { NextConfig } from "next";
import { serviceUrl } from "ports";

const authTarget = process.env.AUTH_PROXY_TARGET || serviceUrl("auth", { hostname: "127.0.0.1" });

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The auth service at /auth-api (same origin, so its session cookie is first-party and shared with the other apps)
  async rewrites() {
    return [{ source: "/auth-api/:path*", destination: `${authTarget}/api/:path*` }];
  },
};

export default nextConfig;
