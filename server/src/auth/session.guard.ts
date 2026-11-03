import { Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from "@nestjs/common";
import type { IncomingMessage } from "node:http";
import { AuthService, type AuthSession } from "./auth.service.js";

export type SessionRequest = IncomingMessage & { authSession?: AuthSession };

// Requires a valid better-auth session (bearer session token or cookie)
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<SessionRequest>();
    const session = await this.authService.getSession(request.headers);
    if (!session) throw new UnauthorizedException("Not signed in");
    request.authSession = session;
    return true;
  }
}
