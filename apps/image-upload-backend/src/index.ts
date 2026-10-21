import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { storage } from "./lib/storage/storage.js";
import { prisma } from "./models/prisma.js";
import { publishImageQueue } from "./queues/publish-image.queue.js";
import { purgeBinQueue } from "./queues/purge-bin.queue.js";

await storage.ensureReady();

publishImageQueue.start();
purgeBinQueue.start();
await purgeBinQueue.every("purge-bin", env.binPurgeCron, {});

const server = serve({ fetch: createApp().fetch, port: env.port }, (info) => {
  console.log(`Image upload server http://localhost:${info.port}`);
});

const shutdown = async () => {
  server.close();
  await Promise.all([publishImageQueue.close(), purgeBinQueue.close()]);
  await prisma.$disconnect();
  process.exit(0);
};
process.once("SIGTERM", () => void shutdown());
process.once("SIGINT", () => void shutdown());
