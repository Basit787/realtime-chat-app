import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service.js";

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.MessageCreateInput) {
    return this.prisma.message.create({ data });
  }

  // Oldest first, capped at `limit`; DMs pass every alias of their room
  findInRooms(rooms: string[], limit: number) {
    return this.prisma.message.findMany({ where: { room: { in: rooms } }, orderBy: { at: "asc" }, take: limit });
  }

  findById(id: string) {
    return this.prisma.message.findUnique({ where: { id } });
  }

  // Live messages from others that `reader` has not read yet, up to `upTo`
  findUnread(rooms: string[], reader: string, upTo: Date) {
    return this.prisma.message.findMany({
      where: {
        room: { in: rooms },
        user: { not: reader },
        deleted: { not: true },
        NOT: { readBy: { has: reader } },
        at: { lte: upTo },
      },
      select: { id: true, user: true, deliveredTo: true, readBy: true },
    });
  }

  // Adds `username` once, like $addToSet
  async addDelivered(id: string, username: string) {
    await this.prisma.message.updateMany({
      where: { id, NOT: { deliveredTo: { has: username } } },
      data: { deliveredTo: { push: username } },
    });
  }

  async markRead(ids: string[], reader: string) {
    await Promise.all([
      this.prisma.message.updateMany({
        where: { id: { in: ids }, NOT: { readBy: { has: reader } } },
        data: { readBy: { push: reader } },
      }),
      this.prisma.message.updateMany({
        where: { id: { in: ids }, NOT: { deliveredTo: { has: reader } } },
        data: { deliveredTo: { push: reader } },
      }),
    ]);
  }

  // Soft delete: text and file are cleared, receipts are kept; null when the message does not exist
  async softDelete(id: string) {
    if (!(await this.findById(id))) return null;
    return this.prisma.message.update({ where: { id }, data: { deleted: true, type: "text", file: { unset: true } } });
  }

  findDmRooms() {
    return this.prisma.message.findMany({ where: { room: { startsWith: "dm.." } }, select: { room: true } });
  }
}
