import { CurrentUser, GENERAL_ROOM, Public, type AuthUser } from "@app/common";
import { StorageService } from "@app/storage";
import { Body, Controller, Get, NotFoundException, Param, Patch, StreamableFile } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import {
  ContactsResponseDto,
  StatusResponseDto,
  UpdateStatusDto,
  UserIdParamDto,
  UsernameParamDto,
} from "./dto/profile.dto.js";
import { PresenceService } from "./presence.service.js";
import { UsersService } from "./users.service.js";

@ApiTags("Profile")
@ApiBearerAuth()
@Controller()
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly presence: PresenceService,
    private readonly storage: StorageService,
  ) {}

  @Public()
  @Get("profile/avatars/by-name/:username")
  async avatarByName(@Param() { username }: UsernameParamDto): Promise<StreamableFile> {
    const key = await this.users.findAvatarKeyByUsername(username);
    if (!key) throw new NotFoundException("Avatar not found");
    return this.storage.streamFile(key, { inline: true });
  }

  @Public()
  @Get("profile/avatars/:userId")
  async avatarById(@Param() { userId }: UserIdParamDto): Promise<StreamableFile> {
    const key = await this.users.findAvatarKey(userId);
    if (!key) throw new NotFoundException("Avatar not found");
    return this.storage.streamFile(key, { inline: true });
  }

  @Get("profile/status")
  @ApiOkResponse({ type: StatusResponseDto })
  async status(@CurrentUser() user: AuthUser): Promise<StatusResponseDto> {
    return { status: await this.presence.getStatus(user.username) };
  }

  @Patch("profile/status")
  @ApiOkResponse({ type: StatusResponseDto })
  async updateStatus(@Body() { status }: UpdateStatusDto, @CurrentUser() user: AuthUser): Promise<StatusResponseDto> {
    await this.presence.setStatus(user.username, status);
    await this.presence.broadcast(GENERAL_ROOM);
    return { status };
  }

  @Get("contacts")
  @ApiTags("Contacts")
  @ApiOkResponse({ type: ContactsResponseDto })
  async contacts(@CurrentUser() user: AuthUser): Promise<ContactsResponseDto> {
    return { contacts: await this.users.getContacts(user.username) };
  }
}
