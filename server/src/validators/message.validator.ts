import { z } from "zod";

export const roomParamSchema = z.object({
  room: z.string().min(1).max(64),
});

export const messageParamSchema = z.object({
  room: z.string().min(1).max(64),
  id: z.string().min(1),
});

export const messageTextSchema = z.string().min(1).max(2000);

export type RoomParam = z.infer<typeof roomParamSchema>;
export type MessageParam = z.infer<typeof messageParamSchema>;
