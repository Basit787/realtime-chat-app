import { Global, Module } from "@nestjs/common";
import { AccessTokenService } from "./access-token.service.js";
import { AuthGuard } from "./auth.guard.js";
import { KeysService } from "./keys.service.js";

// Access-token signing and verification behind the global AuthGuard and the socket handshake
@Global()
@Module({
  providers: [KeysService, AccessTokenService, AuthGuard],
  exports: [KeysService, AccessTokenService, AuthGuard],
})
export class AuthCoreModule {}
