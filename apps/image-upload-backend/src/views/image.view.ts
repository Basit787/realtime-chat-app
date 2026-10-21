import { env } from "../config/env.js";
import type { Image } from "../generated/prisma/client.js";
import { addDays } from "../lib/add-days.js";
import type { ImageDto } from "../types/image-dto.js";

// The JSON shape of an image in every reply
export const imageView = (image: Image): ImageDto => ({
  id: image.id,
  name: image.originalName,
  mimeType: image.mimeType,
  size: image.size,
  status: image.status,
  scheduledAt: image.scheduledAt?.toISOString() ?? null,
  deletedAt: image.deletedAt?.toISOString() ?? null,
  purgeAt: image.deletedAt ? addDays(image.deletedAt, env.binRetentionDays).toISOString() : null,
  createdAt: image.createdAt.toISOString(),
});
