import { Inject, Injectable, Logger, type OnApplicationBootstrap } from "@nestjs/common";
import { APIError } from "better-auth/api";
import { appConfig, type AppConfig } from "@app/common";
import { UserRepository } from "@app/db";
import { AUTH, type AppAuth } from "./auth.factory.js";

// Creates the default admin (ADMIN_EMAIL / ADMIN_PASSWORD) on every startup if it is missing
@Injectable()
export class AdminSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @Inject(AUTH) private readonly auth: AppAuth,
    private readonly users: UserRepository,
    @Inject(appConfig.KEY) private readonly config: AppConfig,
  ) {}

  async onApplicationBootstrap() {
    await this.seed().catch((error) => this.logger.warn(`Seed skipped: ${error}`));
  }

  async seed() {
    const { email, password, name } = this.config.admin;
    try {
      await this.auth.api.signUpEmail({ body: { email, password, name } });
      this.logger.log(`Admin created: ${email}`);
    } catch (error) {
      if (!(error instanceof APIError && error.status === 400)) throw error;
    }
    await this.users.setRoleByEmail(email, "admin");
  }
}
