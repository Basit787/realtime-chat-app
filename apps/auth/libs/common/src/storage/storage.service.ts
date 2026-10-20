import { createObjectStorage, type ObjectStorage } from "backend-common";
import { Inject, Injectable, NotFoundException, StreamableFile, type OnModuleInit } from "@nestjs/common";
import { appConfig, type AppConfig } from "../config/app.config.js";

// The shared MinIO bucket; the auth service owns the `avatars/` prefix
@Injectable()
export class StorageService implements OnModuleInit {
  readonly bucket: ObjectStorage;

  constructor(@Inject(appConfig.KEY) config: AppConfig) {
    if (!config.minio.endpoint) throw new Error("MINIO_ENDPOINT is required for profile photos.");
    this.bucket = createObjectStorage(config.minio);
  }

  async onModuleInit() {
    await this.bucket.ensureReady();
  }

  async streamFile(key: string): Promise<StreamableFile> {
    const object = await this.bucket.getObject(key);
    if (!object) throw new NotFoundException("File not found");
    return new StreamableFile(object.stream, {
      type: object.contentType,
      length: object.contentLength,
      disposition: "inline",
    });
  }
}
