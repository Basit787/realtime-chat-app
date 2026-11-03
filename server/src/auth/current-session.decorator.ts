import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { AuthSession } from "./auth.service.js";
import type { SessionRequest } from "./session.guard.js";

// The session SessionGuard resolved
export const CurrentSession = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthSession =>
    context.switchToHttp().getRequest<SessionRequest>().authSession!,
);
