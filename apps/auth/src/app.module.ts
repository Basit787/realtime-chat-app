import { ApiExceptionFilter, CommonModule } from "@app/common";
import { DbModule } from "@app/db";
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { AccountModule } from "./account/account.module.js";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AuthModule } from "./auth/auth.module.js";
import { KeysModule } from "./keys/keys.module.js";
import { SessionModule } from "./session/session.module.js";

@Module({
  imports: [CommonModule, DbModule, AuthModule, KeysModule, SessionModule, AccountModule],
  controllers: [AppController],
  providers: [AppService, { provide: APP_FILTER, useClass: ApiExceptionFilter }],
})
export class AppModule {}
