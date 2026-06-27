import { z } from "zod";
import { MAX_ROOM_LENGTH } from "../utils/room.js";

export const roomParamSchema = z.object({
  room: z.string().min(1).max(MAX_ROOM_LENGTH),
});

export const messageParamSchema = z.object({
  room: z.string().min(1).max(MAX_ROOM_LENGTH),
  id: z.string().min(1),
});

export const messageTextSchema = z.string().min(1).max(2000);

export type RoomParam = z.infer<typeof roomParamSchema>;
export type MessageParam = z.infer<typeof messageParamSchema>;
