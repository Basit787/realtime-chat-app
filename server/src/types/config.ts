export interface AppConfig {
  port: number;
  mongodbUri: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  corsOrigin: string[];
  uploadDir: string;
  maxFileSizeMb: number;
  turnHost: string;
  turnPort: number;
  turnUser: string;
  turnPassword: string;
}
