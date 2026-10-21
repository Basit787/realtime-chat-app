import { appConfig, type AppConfig } from "@app/common";
import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { DbService } from "./db.service.js";
import { RefreshToken, RefreshTokenSchema } from "./entities/refresh-token.entity.js";
import { SigningKey, SigningKeySchema } from "./entities/signing-key.entity.js";
import { RefreshTokenRepository } from "./repositories/refresh-token.repository.js";
import { SigningKeyRepository } from "./repositories/signing-key.repository.js";
import { UserRepository } from "./repositories/user.repository.js";

// MongoDB connection, the auth service's own entities and their repositories
@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [appConfig.KEY],
      useFactory: (config: AppConfig) => ({ uri: config.mongodbUri }),
    }),
    MongooseModule.forFeature([
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: SigningKey.name, schema: SigningKeySchema },
    ]),
  ],
  providers: [DbService, RefreshTokenRepository, SigningKeyRepository, UserRepository],
  exports: [DbService, RefreshTokenRepository, SigningKeyRepository, UserRepository],
})
export class DbModule {}
