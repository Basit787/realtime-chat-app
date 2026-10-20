import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { SigningKey } from "../entities/signing-key.entity.js";
import { BaseRepository } from "./base.repository.js";

@Injectable()
export class SigningKeyRepository extends BaseRepository<SigningKey> {
  constructor(@InjectModel(SigningKey.name) model: Model<SigningKey>) {
    super(model);
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).lean().exec();
  }

  findLatest() {
    return this.model.findOne().sort({ createdAt: -1 }).lean().exec();
  }
}
