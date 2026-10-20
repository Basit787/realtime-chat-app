import multer from "multer";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { HttpError } from "../http-error.js";

export type UploadOptions = {
  maxFileSizeMb: number;
  // Reject anything that isn't an image/* upload
  imagesOnly?: boolean;
};

type UploadedFileInfo = { originalname: string; mimetype: string };
type AcceptFile = (error: Error | null, acceptFile: boolean) => void;

// Multer options for Nest's MulterModule / FileInterceptor: uploads stay in memory for `objectStorage.put`
export const createUploadOptions = ({ maxFileSizeMb, imagesOnly = false }: UploadOptions) => ({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
  fileFilter: (_req: unknown, file: UploadedFileInfo, accept: AcceptFile) => {
    if (imagesOnly && !file.mimetype.startsWith("image/")) {
      accept(new HttpError(400, "Only image files are allowed"), false);
      return;
    }
    // Never trust client-sent paths in file names
    file.originalname = path.basename(file.originalname);
    accept(null, true);
  },
});

// `folder/<uuid>.<ext>`: a new key per upload, e.g. chat attachments
export const uniqueObjectKey = (folder: string, originalName: string) =>
  `${folder}/${randomUUID()}${path.extname(originalName)}`;

// `folder/<id>.<ext>`: one object per entity, e.g. a user's avatar
export const entityObjectKey = (folder: string, id: string, originalName: string, defaultExt = ".jpg") =>
  `${folder}/${id}${path.extname(originalName).toLowerCase() || defaultExt}`;
