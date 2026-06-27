export interface MinioConfig {
  endpoint: string;
  accessKey: string;
  secretKey: string;
  bucket: string;
  region: string;
}

export interface AppConfig {
  port: number;
  mongodbUri: string;
  betterAuthSecret: string;
  betterAuthUrl: string;
  corsOrigin: string[];
  maxFileSizeMb: number;
  minio: MinioConfig;
  turnHost: string;
  turnPort: number;
  turnUser: string;
  turnPassword: string;
}
