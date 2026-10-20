import { Global, Module } from "@nestjs/common";
import { AuthGuard } from "./auth.guard.js";
import { AuthService } from "./auth.service.js";

// Access-token verification behind the global AuthGuard and the socket handshake
@Global()
@Module({
  providers: [AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthCoreModule {}
