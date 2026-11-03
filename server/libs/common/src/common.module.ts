import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig } from "./config/app.config.js";

// Typed config for every module of the app; environment comes from the process (Docker / shell)
@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [appConfig] })],
})
export class CommonModule {}
