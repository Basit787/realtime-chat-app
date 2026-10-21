import { createJobQueue } from "backend-common";
import { env } from "../config/env.js";
import { publishImageJob } from "../jobs/publish-image.job.js";
import type { PublishImageJob } from "../types/publish-image-job.js";

export const publishImageQueue = createJobQueue<PublishImageJob>("publish-image", publishImageJob, {
  redisUrl: env.redisUrl,
  concurrency: 5,
});
