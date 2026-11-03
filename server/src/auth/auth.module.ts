import { appConfig, type AppConfig } from "@app/common";
import { PrismaService } from "@app/db";
import { Global, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AUTH, createAuth } from "./auth.factory.js";
import { AuthService } from "./auth.service.js";
import { SessionGuard } from "./session.guard.js";

// better-auth (sign-in, sign-up, sessions) and the session lookup the other features guard with
@Global()
@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH,
      inject: [PrismaService, appConfig.KEY],
      useFactory: (prisma: PrismaService, config: AppConfig) => createAuth(prisma, config),
    },
    AuthService,
    SessionGuard,
  ],
  exports: [AUTH, AuthService, SessionGuard],
})
export class AuthModule {}
