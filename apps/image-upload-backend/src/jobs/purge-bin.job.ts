import { env } from "../config/env.js";
import { addDays } from "../lib/add-days.js";
import { storage } from "../lib/storage/storage.js";
import { imageModel } from "../models/image.model.js";

const BATCH_SIZE = 200;

// Deletes images binned more than BIN_RETENTION_DAYS ago from the bucket, then their rows
export const purgeBinJob = async () => {
  const cutoff = addDays(new Date(), -env.binRetentionDays);
  let purged = 0;
  for (;;) {
    const expired = await imageModel.findBinnedBefore(cutoff, BATCH_SIZE);
    if (!expired.length) return { purged };
    await Promise.all(expired.map((image) => storage.delete(image.storedName)));
    await imageModel.deleteMany(expired.map((image) => image.id));
    purged += expired.length;
  }
};
