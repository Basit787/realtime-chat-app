import type { PresenceStatus } from "@app/common";
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service.js";

@Injectable()
export class UserPresenceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findStatus(username: string): Promise<PresenceStatus | undefined> {
    return (await this.prisma.userPresence.findUnique({ where: { username } }))?.status;
  }

  async findStatuses(usernames: string[]): Promise<Map<string, PresenceStatus>> {
    const docs = await this.prisma.userPresence.findMany({ where: { username: { in: usernames } } });
    return new Map(docs.map((doc) => [doc.username, doc.status]));
  }

  async saveStatus(username: string, status: PresenceStatus) {
    const updatedAt = new Date();
    await this.prisma.userPresence.upsert({
      where: { username },
      update: { status, updatedAt },
      create: { username, status, updatedAt },
    });
  }
}
