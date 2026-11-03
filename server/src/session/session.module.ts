import { Module } from "@nestjs/common";
import { RefreshTokenService } from "./refresh-token.service.js";
import { SessionController } from "./session.controller.js";
import { SessionService } from "./session.service.js";

@Module({
  controllers: [SessionController],
  providers: [SessionService, RefreshTokenService],
})
export class SessionModule {}
