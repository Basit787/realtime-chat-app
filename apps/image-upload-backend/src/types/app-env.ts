import type { AuthUser } from "./auth-user.js";

// Hono context variables; `user` is set by requireAuth
export type AppEnv = { Variables: { user: AuthUser } };
