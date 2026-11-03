import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

// The one Prisma client (MongoDB); repositories query through it
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await this.$connect();
    // Prisma cannot declare TTL indexes: MongoDB deletes a refresh token once its expiresAt passes
    await this.$runCommandRaw({
      createIndexes: "refreshtokens",
      indexes: [{ key: { expiresAt: 1 }, name: "expiresAt_ttl", expireAfterSeconds: 0 }],
    }).catch((error: unknown) => this.logger.warn(`TTL index not created: ${String(error)}`));
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
