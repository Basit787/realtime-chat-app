import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { RefreshToken } from "../entities/refresh-token.entity.js";
import { BaseRepository } from "./base.repository.js";

@Injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshToken> {
  constructor(@InjectModel(RefreshToken.name) model: Model<RefreshToken>) {
    super(model);
  }

  findBySession(sessionId: string) {
    return this.model.findOne({ sessionId }).lean().exec();
  }

  // Replaces the token only if it is still `currentHash`, so two parallel refreshes can't both rotate it
  rotate(sessionId: string, currentHash: string, tokenHash: string, expiresAt: Date) {
    return this.model
      .findOneAndUpdate(
        { sessionId, tokenHash: currentHash },
        { $set: { tokenHash, previousHash: currentHash, rotatedAt: new Date(), expiresAt } },
        { new: true },
      )
      .lean()
      .exec();
  }

  async deleteBySession(sessionId: string) {
    await this.model.deleteOne({ sessionId }).exec();
  }

  async deleteByHash(tokenHash: string) {
    await this.model.deleteOne({ tokenHash }).exec();
  }
}
