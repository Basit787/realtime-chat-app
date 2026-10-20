import { StorageService, type UploadedFileData } from "@app/common";
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { IncomingHttpHeaders } from "node:http";
import { AuthService, type AuthSession } from "../auth/auth.service.js";
import { CurrentSession } from "../auth/current-session.decorator.js";
import { SessionGuard } from "../auth/session.guard.js";
import { AccountService } from "./account.service.js";
import { ImageResponseDto, OkResponseDto, UserIdParamDto } from "./dto/account.dto.js";

@ApiTags("Account")
@Controller()
export class AccountController {
  constructor(
    private readonly accountService: AccountService,
    private readonly authService: AuthService,
    private readonly storage: StorageService,
  ) {}

  @Get("avatars/:userId")
  async avatar(@Param() { userId }: UserIdParamDto): Promise<StreamableFile> {
    const key = await this.accountService.findAvatarKey(userId);
    if (!key) throw new NotFoundException("Avatar not found");
    return this.storage.streamFile(key);
  }

  @Post("account/avatar")
  @HttpCode(200)
  @UseGuards(SessionGuard)
  @UseInterceptors(FileInterceptor("photo"))
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { photo: { type: "string", format: "binary" } } } })
  @ApiOkResponse({ type: ImageResponseDto })
  async uploadAvatar(
    @UploadedFile() file: UploadedFileData | undefined,
    @CurrentSession() { user }: AuthSession,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<ImageResponseDto> {
    if (!file) throw new BadRequestException("No image uploaded");
    await this.accountService.saveAvatar(user.id, file);
    const image = this.accountService.avatarUrl(user.id);
    await this.authService.updateImage(headers, image);
    return { image };
  }

  @Delete("account/avatar")
  @UseGuards(SessionGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: OkResponseDto })
  async removeAvatar(
    @CurrentSession() { user }: AuthSession,
    @Headers() headers: IncomingHttpHeaders,
  ): Promise<OkResponseDto> {
    await this.accountService.removeAvatar(user.id);
    await this.authService.updateImage(headers, "");
    return { ok: true };
  }
}
