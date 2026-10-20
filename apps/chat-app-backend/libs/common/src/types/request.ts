import type { IncomingMessage } from "node:http";
import type { AuthUser } from "./auth-user.js";

// The HTTP request as guards see it: Node's request plus the user AuthGuard resolved from the bearer token
export type AuthenticatedRequest = IncomingMessage & { user?: AuthUser };
