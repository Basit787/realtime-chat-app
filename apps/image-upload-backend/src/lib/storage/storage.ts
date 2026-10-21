import { createObjectStorage } from "backend-common";
import { env } from "../../config/env.js";

// This app's MinIO bucket: every uploaded image (Mongo keeps only metadata)
export const storage = createObjectStorage(env.minio);
