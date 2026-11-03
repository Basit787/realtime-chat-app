import { Global, Module } from "@nestjs/common";
import { DbService } from "./db.service.js";
import { PrismaService } from "./prisma.service.js";
import { CallHistoryRepository } from "./repositories/call-history.repository.js";
import { ChatGroupRepository } from "./repositories/chat-group.repository.js";
import { MessageRepository } from "./repositories/message.repository.js";
import { RefreshTokenRepository } from "./repositories/refresh-token.repository.js";
import { SharedFileRepository } from "./repositories/shared-file.repository.js";
import { SigningKeyRepository } from "./repositories/signing-key.repository.js";
import { UserPresenceRepository } from "./repositories/user-presence.repository.js";
import { UserRepository } from "./repositories/user.repository.js";

const repositories = [
  CallHistoryRepository,
  ChatGroupRepository,
  MessageRepository,
  RefreshTokenRepository,
  SharedFileRepository,
  SigningKeyRepository,
  UserPresenceRepository,
  UserRepository,
];

// The data layer: the Prisma client (MongoDB, schema in prisma/schema.prisma) and one repository per model;
// features only use repositories
@Global()
@Module({
  providers: [PrismaService, DbService, ...repositories],
  exports: [PrismaService, DbService, ...repositories],
})
export class DbModule {}
