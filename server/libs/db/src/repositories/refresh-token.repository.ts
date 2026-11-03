import { Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service.js";

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.RefreshTokenCreateInput) {
    return this.prisma.refreshToken.create({ data });
  }

  findBySession(sessionId: string) {
    return this.prisma.refreshToken.findUnique({ where: { sessionId } });
  }

  // Replaces the token only if it is still `currentHash`, so two parallel refreshes can't both rotate it
  async rotate(sessionId: string, currentHash: string, tokenHash: string, expiresAt: Date): Promise<boolean> {
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { sessionId, tokenHash: currentHash },
      data: { tokenHash, previousHash: currentHash, rotatedAt: new Date(), expiresAt },
    });
    return count > 0;
  }

  async deleteBySession(sessionId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { sessionId } });
  }

  async deleteByHash(tokenHash: string) {
    await this.prisma.refreshToken.deleteMany({ where: { tokenHash } });
  }
}
