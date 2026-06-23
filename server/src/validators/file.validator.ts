import { z } from "zod";

export const roomParamSchema = z.object({
  room: z.string().min(1).max(64),
});

export const fileParamSchema = z.object({
  room: z.string().min(1).max(64),
  id: z.string().min(1),
});

export type RoomParam = z.infer<typeof roomParamSchema>;
export type FileParam = z.infer<typeof fileParamSchema>;
