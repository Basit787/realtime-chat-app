import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { config } from "../config/index.js";

export type StoredObject = {
  stream: Readable;
  contentType?: string;
  contentLength?: number;
};

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

let s3Client: S3Client | null = null;

const enabled = () => config.minio.enabled;

const getClient = () => {
  if (!enabled()) return null;
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: config.minio.endpoint,
      region: config.minio.region,
      credentials: {
        accessKeyId: config.minio.accessKey,
        secretAccessKey: config.minio.secretKey,
      },
      forcePathStyle: true,
    });
  }
  return s3Client;
};

const localPath = (key: string) => path.join(config.uploadDir, key);

const ensureReady = async () => {
  if (enabled()) {
    const client = getClient()!;
    try {
      await client.send(new HeadBucketCommand({ Bucket: config.minio.bucket }));
    } catch {
      await client.send(new CreateBucketCommand({ Bucket: config.minio.bucket }));
    }
    return;
  }

  await fs.promises.mkdir(path.join(config.uploadDir, "avatars"), { recursive: true });
  await fs.promises.mkdir(path.join(config.uploadDir, "group-avatars"), { recursive: true });
  await fs.promises.mkdir(path.join(config.uploadDir, "files"), { recursive: true });
};

const exists = async (key: string): Promise<boolean> => {
  if (enabled()) {
    try {
      await getClient()!.send(new HeadObjectCommand({ Bucket: config.minio.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  try {
    await fs.promises.access(localPath(key));
    return true;
  } catch {
    const legacy = path.join(config.uploadDir, path.basename(key));
    try {
      await fs.promises.access(legacy);
      return true;
    } catch {
      return false;
    }
  }
};

const put = async (key: string, body: Buffer, contentType?: string) => {
  if (enabled()) {
    await getClient()!.send(
      new PutObjectCommand({
        Bucket: config.minio.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return;
  }

  const filePath = localPath(key);
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  await fs.promises.writeFile(filePath, body);
};

const getObject = async (key: string): Promise<StoredObject | null> => {
  if (enabled()) {
    try {
      const response = await getClient()!.send(
        new GetObjectCommand({ Bucket: config.minio.bucket, Key: key }),
      );
      if (!response.Body) return null;
      return {
        stream: response.Body as Readable,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
      };
    } catch {
      return null;
    }
  }

  const candidates = [localPath(key), path.join(config.uploadDir, path.basename(key))];
  for (const filePath of candidates) {
    try {
      await fs.promises.access(filePath);
      const stream = fs.createReadStream(filePath);
      return { stream };
    } catch {
      continue;
    }
  }
  return null;
};

const deleteObject = async (key: string) => {
  if (enabled()) {
    try {
      await getClient()!.send(new DeleteObjectCommand({ Bucket: config.minio.bucket, Key: key }));
    } catch {
      // ignore missing objects
    }
    return;
  }

  const candidates = [localPath(key), path.join(config.uploadDir, path.basename(key))];
  await Promise.all(
    candidates.map(async (filePath) => {
      try {
        await fs.promises.unlink(filePath);
      } catch {
        // ignore
      }
    }),
  );
};

const deleteByPrefix = async (prefix: string, keepKey?: string) => {
  if (enabled()) {
    const client = getClient()!;
    let continuationToken: string | undefined;
    do {
      const listing = await client.send(
        new ListObjectsV2Command({
          Bucket: config.minio.bucket,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      );
      const keys =
        listing.Contents?.map((item) => item.Key).filter(
          (key): key is string => !!key && key !== keepKey,
        ) ?? [];
      await Promise.all(keys.map((key) => deleteObject(key)));
      continuationToken = listing.IsTruncated ? listing.NextContinuationToken : undefined;
    } while (continuationToken);
    return;
  }

  const parentKey = prefix.includes("/") ? prefix.slice(0, prefix.lastIndexOf("/") + 1) : "";
  const namePrefix = parentKey ? prefix.slice(parentKey.length) : prefix;
  const dirPath = parentKey ? localPath(parentKey.slice(0, -1)) : config.uploadDir;

  try {
    const entries = await fs.promises.readdir(dirPath);
    await Promise.all(
      entries.map(async (entry) => {
        if (!entry.startsWith(namePrefix)) return;
        const key = `${parentKey}${entry}`;
        if (key === keepKey) return;
        await deleteObject(key);
      }),
    );
  } catch {
    // ignore missing directory
  }
};

const findFirstKey = async (
  prefix: string,
  id: string,
  extensions = IMAGE_EXTENSIONS,
): Promise<string | null> => {
  for (const ext of extensions) {
    const key = `${prefix}${id}${ext}`;
    if (await exists(key)) return key;
  }
  return null;
};

export const objectStorage = {
  get enabled() {
    return enabled();
  },
  ensureReady,
  exists,
  put,
  getObject,
  delete: deleteObject,
  deleteByPrefix,
  findFirstKey,
};

export const streamObjectToResponse = async (
  res: import("express").Response,
  key: string,
  options?: { downloadName?: string; inline?: boolean },
) => {
  const object = await objectStorage.getObject(key);
  if (!object) {
    res.status(404).json({ error: "File not found" });
    return false;
  }

  if (object.contentType) res.setHeader("Content-Type", object.contentType);
  if (object.contentLength) res.setHeader("Content-Length", String(object.contentLength));
  if (options?.downloadName) {
    const disposition = options.inline ? "inline" : "attachment";
    res.setHeader("Content-Disposition", `${disposition}; filename="${options.downloadName}"`);
  }

  object.stream.pipe(res);
  return true;
};
