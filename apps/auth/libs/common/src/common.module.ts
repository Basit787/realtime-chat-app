import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfig } from "./config/app.config.js";
import { StorageService } from "./storage/storage.service.js";

// Typed config and object storage for the whole auth app; env comes from the process
@Global()
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [appConfig] })],
  providers: [StorageService],
  exports: [StorageService],
})
export class CommonModule {}
