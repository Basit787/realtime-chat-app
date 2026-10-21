import { createRemoteJWKSet } from "jose";
import { env } from "../../config/env.js";

// The auth service's public keys, fetched once and cached by jose
export const jwks = createRemoteJWKSet(new URL(env.auth.jwksUrl));
