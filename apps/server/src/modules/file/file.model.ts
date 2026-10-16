import mongoose from "mongoose";

export interface ISharedFile {
  room: string;
  user: string;
  userId: string;
  originalName: string;
  mimeType: string;
  size: number;
  storedName: string;
  at: Date;
}

const sharedFileSchema = new mongoose.Schema<ISharedFile>({
  room: { type: String, required: true, index: true },
  user: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  storedName: { type: String, required: true, unique: true },
  at: { type: Date, default: Date.now },
});

export const SharedFile = mongoose.model<ISharedFile>("SharedFile", sharedFileSchema);

export type SharedFileDocument = mongoose.HydratedDocument<ISharedFile>;
