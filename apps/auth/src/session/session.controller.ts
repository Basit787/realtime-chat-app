import { Controller, Get, Headers, HttpCode, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { IncomingHttpHeaders } from "node:http";
import { AuthService, type AuthSession } from "../auth/auth.service.js";
import { CurrentSession } from "../auth/current-session.decorator.js";
import { SessionGuard } from "../auth/session.guard.js";
import { SessionResponseDto, TokenResponseDto } from "./dto/session.dto.js";
import { SessionService } from "./session.service.js";

@ApiTags("Session")
@ApiBearerAuth()
@Controller()
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly authService: AuthService,
  ) {}

  // Whether the caller is signed in, and as whom
  @Get("session")
  @ApiOkResponse({ type: SessionResponseDto })
  async session(@Headers() headers: IncomingHttpHeaders): Promise<SessionResponseDto> {
    const session = await this.authService.getSession(headers);
    return { authenticated: !!session, user: session?.user ?? null };
  }

  @Post("token")
  @HttpCode(200)
  @UseGuards(SessionGuard)
  @ApiOkResponse({ type: TokenResponseDto })
  token(@CurrentSession() session: AuthSession): Promise<TokenResponseDto> {
    return this.sessionService.issueToken(session);
  }
}
