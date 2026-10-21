import { createJobQueue } from "backend-common";
import { env } from "../config/env.js";
import { purgeBinJob } from "../jobs/purge-bin.job.js";

export const purgeBinQueue = createJobQueue<Record<string, never>>("purge-bin", purgeBinJob, {
  redisUrl: env.redisUrl,
});
