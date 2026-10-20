import { AuthService } from "@app/auth";
import { appConfig, corsOriginCallback, httpValidationPipe, type AppConfig } from "@app/common";
import { DbService } from "@app/db";
import { AuthenticatedIoAdapter } from "@app/realtime";
import { Logger, type INestApplicationContext } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { setupSwagger } from "./swagger.js";

// `node dist/src/main.js reset` (pnpm db:reset) runs on the app's own context
const COMMANDS: Record<string, (app: INestApplicationContext) => Promise<string>> = {
  reset: async (app) => {
    await app.get(DbService).reset();
    return "Database cleared (messages, files)";
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

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      // Swagger UI needs inline scripts/styles and the validator badge image
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "blob:", "https://validator.swagger.io"],
        },
      },
    }),
  );
  app.enableCors({ origin: corsOriginCallback(config), credentials: true });
  app.useGlobalPipes(httpValidationPipe());
  app.useWebSocketAdapter(new AuthenticatedIoAdapter(app, app.get(AuthService), config));
  app.enableShutdownHooks();
  setupSwagger(app);

  await app.listen(config.port);
  Logger.log(`Chat server http://localhost:${config.port}`, "Bootstrap");
}

const command = process.argv[2];
await (command && command in COMMANDS ? runCommand(command) : bootstrap());
