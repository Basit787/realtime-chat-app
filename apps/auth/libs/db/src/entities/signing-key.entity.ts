import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import type { JWK } from "jose";

// The key pair that signs access tokens; the public half is served as JWKS
@Schema({ timestamps: true })
export class SigningKey {
  @Prop({ required: true, unique: true })
  kid!: string;

  @Prop({ required: true })
  alg!: string;

  @Prop({ type: Object, required: true })
  publicJwk!: JWK;

  @Prop({ type: Object, required: true })
  privateJwk!: JWK;

  // Set by `timestamps: true`
  createdAt!: Date;
}

export const SigningKeySchema = SchemaFactory.createForClass(SigningKey);
