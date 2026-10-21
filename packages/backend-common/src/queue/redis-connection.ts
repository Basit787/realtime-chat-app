import type { ConnectionOptions } from "bullmq";

// BullMQ connection options from a redis:// URL; workers need `maxRetriesPerRequest: null`
export const redisConnection = (url: string): ConnectionOptions => {
  const { hostname, port, username, password, pathname } = new URL(url);
  return {
    host: hostname,
    port: Number(port) || 6379,
    username: username || undefined,
    password: password ? decodeURIComponent(password) : undefined,
    db: Number(pathname.slice(1)) || 0,
    maxRetriesPerRequest: null,
  };
};
