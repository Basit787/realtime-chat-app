import { createAuthClient } from "#/common";

// Accounts live on the chat server under /api, proxied by Vite so the session cookie is first-party
export const authClient = createAuthClient({ baseUrl: import.meta.env.VITE_API_URL ?? "/api" });
