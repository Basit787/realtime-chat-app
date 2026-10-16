import { Schema, model } from "mongoose";

export type PresenceStatus = "online" | "away" | "busy" | "offline";

export interface IUserPresence {
  username: string;
  status: PresenceStatus;
  updatedAt: Date;
}

const userPresenceSchema = new Schema<IUserPresence>(
  {
    username: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["online", "away", "busy", "offline"], default: "online" },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

export const UserPresence = model<IUserPresence>("UserPresence", userPresenceSchema);
