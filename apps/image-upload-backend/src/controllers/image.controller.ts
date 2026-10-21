import { uniqueObjectKey } from "backend-common";
import { bodyLimit } from "hono/body-limit";
import { HTTPException } from "hono/http-exception";
import path from "node:path";
import { Readable } from "node:stream";
import { env } from "../config/env.js";
import { factory } from "../lib/factory.js";
import { storage } from "../lib/storage/storage.js";
import { zodValidator } from "../middleware/zod-validator.js";
import { imageModel } from "../models/image.model.js";
import { publishImageQueue } from "../queues/publish-image.queue.js";
import type { ImageCountsDto } from "../types/image-counts-dto.js";
import type { ImagePageDto } from "../types/image-page-dto.js";
import { imageIdParamsSchema } from "../validation/image-id-params-schema.js";
import { listImagesQuerySchema } from "../validation/list-images-query-schema.js";
import { pageQuerySchema } from "../validation/page-query-schema.js";
import { uploadImageSchema } from "../validation/upload-image-schema.js";
import { imageView } from "../views/image.view.js";

const notFound = () => new HTTPException(404, { message: "Image not found" });

export const imageController = {
  list: factory.createHandlers(zodValidator("query", listImagesQuerySchema), async (c) => {
    const { status, page, pageSize } = c.req.valid("query");
    const [images, total] = await imageModel.findPageByUser(c.var.user.id, status, (page - 1) * pageSize, pageSize);
    return c.json({ images: images.map(imageView), total, page, pageSize } satisfies ImagePageDto);
  }),

  bin: factory.createHandlers(zodValidator("query", pageQuerySchema), async (c) => {
    const { page, pageSize } = c.req.valid("query");
    const [images, total] = await imageModel.findBinPageByUser(c.var.user.id, (page - 1) * pageSize, pageSize);
    return c.json({ images: images.map(imageView), total, page, pageSize } satisfies ImagePageDto);
  }),

  counts: factory.createHandlers(async (c) => {
    const [active, scheduled, bin] = await imageModel.countByUser(c.var.user.id);
    return c.json({ active, scheduled, bin } satisfies ImageCountsDto);
  }),

  // Stores the bytes in MinIO and the metadata in PostgreSQL; a scheduled upload is published by the queue
  upload: factory.createHandlers(
    bodyLimit({
      maxSize: env.maxFileSizeMb * 1024 * 1024,
      onError: (c) => c.json({ error: `Images must be ${env.maxFileSizeMb} MB or smaller` }, 413),
    }),
    zodValidator("form", uploadImageSchema),
    async (c) => {
      const { file, scheduledAt } = c.req.valid("form");
      // Never trust client-sent paths in file names
      const originalName = path.basename(file.name);
      const storedName = uniqueObjectKey("images", originalName);
      await storage.put(storedName, Buffer.from(await file.arrayBuffer()), file.type);
      const image = await imageModel.create({
        userId: c.var.user.id,
        originalName,
        mimeType: file.type,
        size: file.size,
        storedName,
        status: scheduledAt ? "scheduled" : "active",
        scheduledAt: scheduledAt ?? null,
      });
      if (scheduledAt) await publishImageQueue.addAt(scheduledAt, { imageId: image.id }, { jobId: image.id });
      return c.json(imageView(image), 201);
    },
  ),

  file: factory.createHandlers(zodValidator("param", imageIdParamsSchema), async (c) => {
    const image = await imageModel.findOwned(c.req.valid("param").id, c.var.user.id);
    const object = image && (await storage.getObject(image.storedName));
    if (!image || !object) throw notFound();
    return c.body(Readable.toWeb(object.stream) as ReadableStream, 200, {
      "Content-Type": object.contentType ?? image.mimeType,
      "Cache-Control": "private, max-age=3600",
    });
  }),

  // Moves the image to the bin; the purge-bin job deletes it after BIN_RETENTION_DAYS
  remove: factory.createHandlers(zodValidator("param", imageIdParamsSchema), async (c) => {
    const image = await imageModel.findOwned(c.req.valid("param").id, c.var.user.id);
    if (!image || image.deletedAt) throw notFound();
    await imageModel.moveToBin(image.id);
    return c.json({ ok: true as const });
  }),

  restore: factory.createHandlers(zodValidator("param", imageIdParamsSchema), async (c) => {
    const image = await imageModel.findOwned(c.req.valid("param").id, c.var.user.id);
    if (!image?.deletedAt) throw notFound();
    return c.json(imageView(await imageModel.restore(image.id)));
  }),

  // Deletes a binned image for good: the object in MinIO, then its row
  purge: factory.createHandlers(zodValidator("param", imageIdParamsSchema), async (c) => {
    const image = await imageModel.findOwned(c.req.valid("param").id, c.var.user.id);
    if (!image?.deletedAt) throw notFound();
    await storage.delete(image.storedName);
    await imageModel.deleteMany([image.id]);
    return c.json({ ok: true as const });
  }),
};
