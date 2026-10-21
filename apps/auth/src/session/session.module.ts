import { Module } from "@nestjs/common";
import { KeysModule } from "../keys/keys.module.js";
import { RefreshTokenService } from "./refresh-token.service.js";
import { SessionController } from "./session.controller.js";
import { SessionService } from "./session.service.js";

@Module({
  imports: [KeysModule],
  controllers: [SessionController],
  providers: [SessionService, RefreshTokenService],
})
export class SessionModule {}
