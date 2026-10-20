import { IS_PUBLIC, type AuthenticatedRequest } from "@app/common";
import { Injectable, UnauthorizedException, type CanActivate, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthService } from "./auth.service.js";

// Registered globally: every HTTP route needs a valid bearer token unless marked @Public()
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== "http") return true;
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [context.getHandler(), context.getClass()]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = await this.authService.getSessionUser(request.headers);
    if (!user) throw new UnauthorizedException("Authentication required");
    request.user = user;
    return true;
  }
}
