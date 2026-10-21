import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

// The rotating refresh token of one better-auth session; only SHA-256 hashes are stored
@Schema({ timestamps: true })
export class RefreshToken {
  @Prop({ required: true, unique: true })
  sessionId!: string;

  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, unique: true })
  tokenHash!: string;

  // The token it replaced, still accepted for a few seconds so parallel refreshes (several tabs/apps) don't collide
  @Prop()
  previousHash?: string;

  @Prop()
  rotatedAt?: Date;

  // MongoDB deletes the document once this passes (TTL index)
  @Prop({ required: true, expires: 0 })
  expiresAt!: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);
