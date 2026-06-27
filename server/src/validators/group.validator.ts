import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().trim().min(1).max(64),
  description: z.string().trim().max(500).optional(),
  members: z.array(z.string().min(1).max(64)).min(1).max(31),
});

export const updateGroupSchema = z.object({
  name: z.string().trim().min(1).max(64).optional(),
  description: z.string().trim().max(500).optional(),
});

export type CreateGroupBody = z.infer<typeof createGroupSchema>;
export type UpdateGroupBody = z.infer<typeof updateGroupSchema>;
