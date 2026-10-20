import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { Connection } from "mongoose";

// better-auth's `user` collection, read through the raw driver because better-auth owns its schema
@Injectable()
export class UserRepository {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  private get users() {
    return this.connection.getClient().db().collection("user");
  }

  async setRoleByEmail(email: string, role: "user" | "admin") {
    await this.users.updateOne({ email }, { $set: { role } });
  }
}
