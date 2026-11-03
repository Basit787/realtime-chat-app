import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service.js";

@Injectable()
export class DbService {
  constructor(private readonly prisma: PrismaService) {}

  // Deletes every message and file record (`pnpm db:reset`); MinIO objects, accounts and sessions are kept
  async reset() {
    await Promise.all([this.prisma.message.deleteMany(), this.prisma.sharedFile.deleteMany()]);
  }
}
