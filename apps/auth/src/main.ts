import { appConfig, corsOriginCallback, httpValidationPipe, type AppConfig } from "@app/common";
import { DbService } from "@app/db";
import { Logger, RequestMethod, type INestApplicationContext } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { AdminSeeder } from "./auth/admin-seeder.service.js";
import { setupSwagger } from "./swagger.js";

// `node dist/src/main.js seed|reset` (pnpm db:seed / db:reset) run on the app's own context
const COMMANDS: Record<string, (app: INestApplicationContext) => Promise<string>> = {
  seed: async (app) => {
    await app.get(AdminSeeder).seed();
    return "Admin user is ready";
  },
  reset: async (app) => {
    await app.get(DbService).reset();
    return "Accounts and sessions cleared";
  },
};

const runCommand = async (command: string) => {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ["error", "warn"] });
  try {
    Logger.log(await COMMANDS[command](app), "Database");
  } finally {
    await app.close();
  }
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfig>(appConfig.KEY);

  app.setGlobalPrefix("api", { exclude: [{ path: ".well-known/jwks.json", method: RequestMethod.GET }] });
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      // HSTS only in production: received over dev HTTPS it forces https on every localhost port for a year
      strictTransportSecurity: process.env.NODE_ENV === "production",
      // Swagger UI needs inline scripts/styles
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:"],
        },
      },
    }),
  );
  app.enableCors({ origin: corsOriginCallback(config), credentials: true, exposedHeaders: ["set-auth-token"] });
  app.useGlobalPipes(httpValidationPipe());
  app.enableShutdownHooks();
  setupSwagger(app);

  await app.listen(config.port);
  Logger.log(`Auth service http://localhost:${config.port}`, "Bootstrap");
}

const command = process.argv[2];
await (command && command in COMMANDS ? runCommand(command) : bootstrap());
