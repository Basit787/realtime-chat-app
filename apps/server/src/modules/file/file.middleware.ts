import { createUploadMiddleware, uniqueObjectKey } from "@chat/backend-common";
import { config } from "../../config/index.js";

export const uploadMiddleware = createUploadMiddleware({ maxFileSizeMb: config.maxFileSizeMb });

export const buildFileObjectKey = (originalName: string) => uniqueObjectKey("files", originalName);
