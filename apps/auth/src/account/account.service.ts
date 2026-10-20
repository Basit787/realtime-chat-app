import { appConfig, StorageService, type AppConfig, type UploadedFileData } from "@app/common";
import { entityObjectKey } from "backend-common";
import { Inject, Injectable } from "@nestjs/common";

const AVATAR_FOLDER = "avatars";

// Profile photos in MinIO; the rest of the account is updated through better-auth
@Injectable()
export class AccountService {
  constructor(
    private readonly storage: StorageService,
    @Inject(appConfig.KEY) private readonly config: AppConfig,
  ) {}

  // Absolute so every app can load it; the version busts caches after a change
  avatarUrl(userId: string, version = Date.now()) {
    return `${this.config.publicUrl}/api/avatars/${userId}?v=${version}`;
  }

  findAvatarKey(userId: string) {
    return this.storage.bucket.findFirstKey(`${AVATAR_FOLDER}/`, userId);
  }

  async saveAvatar(userId: string, file: UploadedFileData) {
    const key = entityObjectKey(AVATAR_FOLDER, userId, file.originalname);
    await this.storage.bucket.deleteByPrefix(`${AVATAR_FOLDER}/${userId}`, key);
    await this.storage.bucket.put(key, file.buffer, file.mimetype);
  }

  removeAvatar(userId: string) {
    return this.storage.bucket.deleteByPrefix(`${AVATAR_FOLDER}/${userId}`);
  }
}
