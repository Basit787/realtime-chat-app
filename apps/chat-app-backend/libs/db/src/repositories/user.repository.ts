import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import type { Connection } from "mongoose";

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type AuthUserRecord = { _id: { toString(): string }; name?: string; image?: string };

// The auth service's `user` collection (same database), read-only through the raw driver
@Injectable()
export class UserRepository {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  private get users() {
    return this.connection.getClient().db().collection("user");
  }

  async findIdByName(username: string): Promise<string | null> {
    const user = await this.users.findOne({ name: { $regex: new RegExp(`^${escapeRegex(username)}$`, "i") } });
    return user?._id.toString() ?? null;
  }

  async listNamesAndImages(): Promise<{ name: string; image: string }[]> {
    const users = (await this.users.find({}, { projection: { name: 1, image: 1 } }).toArray()) as AuthUserRecord[];
    return users.filter((u) => !!u.name).map((u) => ({ name: u.name!, image: u.image ?? "" }));
  }
}
