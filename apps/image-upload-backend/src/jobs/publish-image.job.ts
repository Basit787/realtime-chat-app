import type { Job } from "bullmq";
import { imageModel } from "../models/image.model.js";
import type { PublishImageJob } from "../types/publish-image-job.js";

// A scheduled upload reaches its time and shows up in the gallery
export const publishImageJob = async (job: Job<PublishImageJob>) => {
  await imageModel.publish(job.data.imageId);
};
