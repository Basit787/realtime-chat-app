import { appConfig, type AppConfig } from "@app/common";
import { Global, Module } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/mongoose";
import type { Connection } from "mongoose";
import { AdminSeeder } from "./admin-seeder.service.js";
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
      inject: [getConnectionToken(), appConfig.KEY],
      useFactory: (connection: Connection, config: AppConfig) => createAuth(connection, config),
    },
    AuthService,
    SessionGuard,
    AdminSeeder,
  ],
  exports: [AUTH, AuthService, SessionGuard, AdminSeeder],
})
export class AuthModule {}
