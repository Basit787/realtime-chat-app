import { Injectable } from "@nestjs/common";
import { decodeJwt } from "jose";
import type { AuthSession } from "../auth/auth.service.js";
import { KeysService } from "../keys/keys.service.js";
import type { TokenResponseDto } from "./dto/session.dto.js";

@Injectable()
export class SessionService {
  constructor(private readonly keys: KeysService) {}

  // Exchanges a session for an access token carrying the identity every app needs
  async issueToken({ user }: AuthSession): Promise<TokenResponseDto> {
    const accessToken = await this.keys.sign(user.id, {
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.image,
    });
    return { accessToken, expiresAt: decodeJwt(accessToken).exp! * 1000, user };
  }
}
