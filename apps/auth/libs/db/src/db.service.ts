import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { Connection } from "mongoose";

// better-auth's collections, owned by this service
const AUTH_COLLECTIONS = ["user", "session", "account", "verification"];

@Injectable()
export class DbService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  // Deletes every account and session (`pnpm --filter @chat/auth db:reset`)
  async reset() {
    const db = this.connection.getClient().db();
    await Promise.all(AUTH_COLLECTIONS.map((name) => db.collection(name).deleteMany({})));
  }
}
