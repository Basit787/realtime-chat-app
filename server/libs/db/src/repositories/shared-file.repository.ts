import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service.js";

@Injectable()
export class SharedFileRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.SharedFileCreateInput) {
    return this.prisma.sharedFile.create({ data });
  }

  findInRoom(room: string, id: string) {
    return this.prisma.sharedFile.findFirst({ where: { id, room } });
  }
}
