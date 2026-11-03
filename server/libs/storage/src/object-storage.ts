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

/** Any S3-compatible store (MinIO, AWS S3, R2…). */
export type ObjectStorageConfig = {
  endpoint: string;
  region: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
};

export type StoredObject = {
  stream: Readable;
  contentType?: string;
  contentLength?: number;
};

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export const createObjectStorage = (config: ObjectStorageConfig) => {
  let client: S3Client | null = null;
  const Bucket = config.bucket;

  const getClient = (): S3Client => {
    if (!config.endpoint) throw new Error("Object storage endpoint is required");
    client ??= new S3Client({
      endpoint: config.endpoint,
      region: config.region,
      credentials: { accessKeyId: config.accessKey, secretAccessKey: config.secretKey },
      forcePathStyle: true,
    });
    return client;
  };

  /** Creates the bucket if it doesn't exist yet. */
  const ensureReady = async () => {
    try {
      await getClient().send(new HeadBucketCommand({ Bucket }));
    } catch {
      await getClient().send(new CreateBucketCommand({ Bucket }));
    }
  };

  const exists = async (key: string): Promise<boolean> => {
    try {
      await getClient().send(new HeadObjectCommand({ Bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  };

  const put = async (key: string, body: Buffer, contentType?: string) => {
    await getClient().send(new PutObjectCommand({ Bucket, Key: key, Body: body, ContentType: contentType }));
  };

  const getObject = async (key: string): Promise<StoredObject | null> => {
    try {
      const response = await getClient().send(new GetObjectCommand({ Bucket, Key: key }));
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
      await getClient().send(new DeleteObjectCommand({ Bucket, Key: key }));
    } catch {
      // ignore missing objects
    }
  };

  /** Deletes every object under `prefix`, optionally keeping one key. */
  const deleteByPrefix = async (prefix: string, keepKey?: string) => {
    let continuationToken: string | undefined;
    do {
      const listing = await getClient().send(
        new ListObjectsV2Command({ Bucket, Prefix: prefix, ContinuationToken: continuationToken }),
      );
      const keys =
        listing.Contents?.map((item) => item.Key).filter((key): key is string => !!key && key !== keepKey) ?? [];
      await Promise.all(keys.map((key) => deleteObject(key)));
      continuationToken = listing.IsTruncated ? listing.NextContinuationToken : undefined;
    } while (continuationToken);
  };

  /** First existing `${prefix}${id}${ext}` for the given extensions (e.g. an avatar of unknown type). */
  const findFirstKey = async (prefix: string, id: string, extensions = IMAGE_EXTENSIONS): Promise<string | null> => {
    for (const ext of extensions) {
      const key = `${prefix}${id}${ext}`;
      if (await exists(key)) return key;
    }
    return null;
  };

  return { ensureReady, exists, put, getObject, delete: deleteObject, deleteByPrefix, findFirstKey };
};

export type ObjectStorage = ReturnType<typeof createObjectStorage>;
