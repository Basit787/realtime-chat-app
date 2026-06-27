import mongoose from "mongoose";

export interface IChatGroup {
  name: string;
  description: string;
  image: string;
  members: string[];
  createdBy: string;
}

const chatGroupSchema = new mongoose.Schema<IChatGroup>(
  {
    name: { type: String, required: true, maxlength: 64, trim: true },
    description: { type: String, default: "", maxlength: 500, trim: true },
    image: { type: String, default: "" },
    members: { type: [String], required: true, index: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

chatGroupSchema.index({ members: 1 });

export const ChatGroup = mongoose.model<IChatGroup>("ChatGroup", chatGroupSchema);

export type ChatGroupDocument = mongoose.HydratedDocument<IChatGroup>;
