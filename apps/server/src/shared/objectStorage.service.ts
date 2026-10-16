import { createObjectStorage } from "@chat/backend-common";
import { config } from "../config/index.js";

/** This app's MinIO bucket (all chat files, avatars and group images). */
export const objectStorage = createObjectStorage(config.minio);

export const streamObjectToResponse = objectStorage.streamToResponse;
