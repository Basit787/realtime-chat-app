import { createUploadOptions } from "backend-common";
import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { AccountController } from "./account.controller.js";
import { AccountService } from "./account.service.js";

const MAX_AVATAR_SIZE_MB = 5;

@Module({
  imports: [MulterModule.register(createUploadOptions({ maxFileSizeMb: MAX_AVATAR_SIZE_MB, imagesOnly: true }))],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
