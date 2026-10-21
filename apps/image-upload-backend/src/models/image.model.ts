import type { Image } from "../generated/prisma/client.js";
import { prisma } from "./prisma.js";

type NewImage = Pick<Image, "userId" | "originalName" | "mimeType" | "size" | "storedName" | "status" | "scheduledAt">;

// Every query on the `images` table; user-facing lookups are scoped to the owner's user id
export const imageModel = {
  create: (data: NewImage) => prisma.image.create({ data }),
  // Newest first; scheduled ones by publish time, soonest first
  findPageByUser: (userId: string, status: Image["status"], skip: number, take: number) => {
    const where = { userId, status, deletedAt: null };
    return prisma.$transaction([
      prisma.image.findMany({
        where,
        orderBy: status === "scheduled" ? { scheduledAt: "asc" } : { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.image.count({ where }),
    ]);
  },
  findBinPageByUser: (userId: string, skip: number, take: number) => {
    const where = { userId, deletedAt: { not: null } };
    return prisma.$transaction([
      prisma.image.findMany({ where, orderBy: { deletedAt: "desc" }, skip, take }),
      prisma.image.count({ where }),
    ]);
  },
  countByUser: (userId: string) =>
    prisma.$transaction([
      prisma.image.count({ where: { userId, status: "active", deletedAt: null } }),
      prisma.image.count({ where: { userId, status: "scheduled", deletedAt: null } }),
      prisma.image.count({ where: { userId, deletedAt: { not: null } } }),
    ]),
  findOwned: (id: string, userId: string) => prisma.image.findFirst({ where: { id, userId } }),
  moveToBin: (id: string) => prisma.image.update({ where: { id }, data: { deletedAt: new Date() } }),
  restore: (id: string) => prisma.image.update({ where: { id }, data: { deletedAt: null } }),
  // No-op when the image is gone or already active
  publish: (id: string) => prisma.image.updateMany({ where: { id, status: "scheduled" }, data: { status: "active" } }),
  findBinnedBefore: (cutoff: Date, take: number) =>
    prisma.image.findMany({ where: { deletedAt: { lt: cutoff } }, orderBy: { deletedAt: "asc" }, take }),
  deleteMany: (ids: string[]) => prisma.image.deleteMany({ where: { id: { in: ids } } }),
};
