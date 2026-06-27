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

const requireMinio = () => {
  if (!config.minio.endpoint) {
    throw new Error("MINIO_ENDPOINT is required. All uploads are stored in MinIO.");
  }
};

const getClient = (): S3Client => {
  requireMinio();
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

const ensureReady = async () => {
  const client = getClient();
  try {
    await client.send(new HeadBucketCommand({ Bucket: config.minio.bucket }));
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: config.minio.bucket }));
  }
};

const exists = async (key: string): Promise<boolean> => {
  try {
    await getClient().send(new HeadObjectCommand({ Bucket: config.minio.bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
};

const put = async (key: string, body: Buffer, contentType?: string) => {
  await getClient().send(
    new PutObjectCommand({
      Bucket: config.minio.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
};

const getObject = async (key: string): Promise<StoredObject | null> => {
  try {
    const response = await getClient().send(
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
};

const deleteObject = async (key: string) => {
  try {
    await getClient().send(new DeleteObjectCommand({ Bucket: config.minio.bucket, Key: key }));
  } catch {
    // ignore missing objects
  }
};

const deleteByPrefix = async (prefix: string, keepKey?: string) => {
  const client = getClient();
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
  if (options?.inline) {
    res.setHeader("Content-Disposition", "inline");
  } else if (options?.downloadName) {
    res.setHeader("Content-Disposition", `attachment; filename="${options.downloadName}"`);
  }

  object.stream.pipe(res);
  return true;
};
