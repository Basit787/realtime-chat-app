import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthUser } from "../types/auth-user.js";
import type { AuthenticatedRequest } from "../types/request.js";

// The user AuthGuard resolved from the bearer token
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user!,
);
