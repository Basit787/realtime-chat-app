import { Controller, Get, Headers, HttpCode, Post, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { IncomingHttpHeaders, ServerResponse } from "node:http";
import { OkResponseDto } from "../account/dto/account.dto.js";
import { AuthService, type AuthSession } from "../auth/auth.service.js";
import { CurrentSession } from "../auth/current-session.decorator.js";
import { SessionGuard } from "../auth/session.guard.js";
import { SessionResponseDto, TokenResponseDto } from "./dto/session.dto.js";
import { RefreshTokenService } from "./refresh-token.service.js";
import { SessionService } from "./session.service.js";

@ApiTags("Session")
@ApiBearerAuth()
@Controller()
export class SessionController {
  constructor(
    private readonly sessionService: SessionService,
    private readonly authService: AuthService,
    private readonly refreshTokens: RefreshTokenService,
  ) {}

  // Whether the caller is signed in, and as whom
  @Get("session")
  @ApiOkResponse({ type: SessionResponseDto })
  async session(@Headers() headers: IncomingHttpHeaders): Promise<SessionResponseDto> {
    const session = await this.authService.getSession(headers);
    return { authenticated: !!session, user: session?.user ?? null };
  }

  // New access token; the refresh-token cookie is rotated, and a missing or reused one ends the session
  @Post("token")
  @HttpCode(200)
  @UseGuards(SessionGuard)
  @ApiOkResponse({ type: TokenResponseDto })
  async token(
    @CurrentSession() session: AuthSession,
    @Headers() headers: IncomingHttpHeaders,
    @Res({ passthrough: true }) res: ServerResponse,
  ): Promise<TokenResponseDto> {
    const result = await this.refreshTokens.refresh(session, headers);
    if (result.status === "rejected") {
      res.setHeader("set-cookie", await this.endSessionCookies(headers));
      throw new UnauthorizedException("Your session has ended, please sign in again");
    }
    if (result.status === "rotated") res.setHeader("set-cookie", this.refreshTokens.cookie(result.token));
    return this.sessionService.issueToken(session);
  }

  // Signs out: deletes the refresh token and the session from the database and clears both cookies
  @Post("logout")
  @HttpCode(200)
  @ApiOkResponse({ type: OkResponseDto })
  async logout(
    @Headers() headers: IncomingHttpHeaders,
    @Res({ passthrough: true }) res: ServerResponse,
  ): Promise<OkResponseDto> {
    const session = await this.authService.getSession(headers);
    await this.refreshTokens.revoke(headers, session?.sessionId);
    res.setHeader("set-cookie", await this.endSessionCookies(headers));
    return { ok: true };
  }

  private async endSessionCookies(headers: IncomingHttpHeaders) {
    return [...(await this.authService.signOut(headers)), this.refreshTokens.clearedCookie()];
  }
}
