import multer from "multer";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { HttpError } from "../http-error.js";

export type UploadOptions = {
  maxFileSizeMb: number;
  /** Reject anything that isn't an image/* upload */
  imagesOnly?: boolean;
};

/** Multer middleware that keeps the upload in memory (for `objectStorage.put`), with a size limit. */
export const createUploadMiddleware = ({ maxFileSizeMb, imagesOnly = false }: UploadOptions) =>
  multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (imagesOnly && !file.mimetype.startsWith("image/")) {
        cb(new HttpError(400, "Only image files are allowed"));
        return;
      }
      // Never trust client-sent paths in file names
      file.originalname = path.basename(file.originalname);
      cb(null, true);
    },
  });

/** `folder/<uuid>.<ext>`: a new key per upload, e.g. chat attachments. */
export const uniqueObjectKey = (folder: string, originalName: string) =>
  `${folder}/${randomUUID()}${path.extname(originalName)}`;

/** `folder/<id>.<ext>`: one object per entity, e.g. a user's avatar. */
export const entityObjectKey = (folder: string, id: string, originalName: string, defaultExt = ".jpg") =>
  `${folder}/${id}${path.extname(originalName).toLowerCase() || defaultExt}`;
