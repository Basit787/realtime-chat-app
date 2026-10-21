import { createAuthClient } from "frontend-common";

// The shared auth service, proxied by Next at /auth-api so its session cookie is first-party
export const authClient = createAuthClient({ baseUrl: "/auth-api" });
