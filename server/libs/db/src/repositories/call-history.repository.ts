import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service.js";

@Injectable()
export class CallHistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.CallHistoryCreateInput) {
    return this.prisma.callHistory.create({ data });
  }

  // Newest first; with `peer`, only calls between the two users
  findForUser(username: string, limit: number, peer?: string) {
    const where: Prisma.CallHistoryWhereInput = peer
      ? {
          OR: [
            { caller: username, callee: peer },
            { caller: peer, callee: username },
          ],
        }
      : { OR: [{ caller: username }, { callee: username }] };
    return this.prisma.callHistory.findMany({ where, orderBy: { startedAt: "desc" }, take: limit });
  }

  findParticipantsFor(username: string) {
    return this.prisma.callHistory.findMany({
      where: { OR: [{ caller: username }, { callee: username }] },
      select: { caller: true, callee: true },
    });
  }
}
