import type { Request, Response } from "express";
import { groupService } from "../services/group.service.js";
import {
  findGroupAvatarKey,
  groupAvatarPublicPath,
  removeGroupAvatarFiles,
  saveGroupAvatar,
} from "../services/groupAvatar.service.js";
import { streamObjectToResponse } from "../services/objectStorage.service.js";
import type { ApiErrorResponse, ChatGroupDto, ChatGroupsResponse, ProfileAvatarResponse } from "../types/api.js";
import { createGroupSchema, updateGroupSchema } from "../validators/group.validator.js";
import { HttpError } from "../utils/httpError.js";

export const listGroups = async (req: Request, res: Response<ChatGroupsResponse>): Promise<void> => {
  try {
    const groups = await groupService.listForUser(req.user!.username);
    res.json({ groups });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};

export const getGroup = async (
  req: Request,
  res: Response<ChatGroupDto | ApiErrorResponse>,
): Promise<void> => {
  try {
    const group = await groupService.getById(req.params.groupId as string, req.user!.username);
    if (!group) {
      throw new HttpError(404, "Group not found");
    }
    res.json(group);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};

export const createGroup = async (
  req: Request,
  res: Response<ChatGroupDto | ApiErrorResponse>,
): Promise<void> => {
  try {
    const parsed = createGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid request", parsed.error.flatten().fieldErrors);
    }

    const username = req.user!.username;
    const members = parsed.data.members.filter((m) => m !== username);
    const group = await groupService.create(
      parsed.data.name,
      members,
      username,
      parsed.data.description ?? "",
    );
    res.status(201).json(group);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};

export const updateGroup = async (
  req: Request,
  res: Response<ChatGroupDto | ApiErrorResponse>,
): Promise<void> => {
  try {
    const parsed = updateGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid request", parsed.error.flatten().fieldErrors);
    }

    const group = await groupService.update(req.params.groupId as string, req.user!.username, parsed.data);
    if (!group) {
      throw new HttpError(403, "Only the group creator can update group details");
    }
    res.json(group);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};

export const uploadGroupAvatar = async (
  req: Request,
  res: Response<ProfileAvatarResponse | ApiErrorResponse>,
): Promise<void> => {
  try {
    if (!req.file || !req.user) {
      throw new HttpError(400, "No image uploaded");
    }

    const groupId = req.params.groupId as string;
    await saveGroupAvatar(groupId, req.file);

    const image = groupAvatarPublicPath(groupId);
    const group = await groupService.setImage(groupId, req.user.username, image);
    if (!group) {
      throw new HttpError(403, "Only the group creator can update the group photo");
    }

    res.json({ image });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};

export const getGroupAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const groupId = req.params.groupId as string;
    const key = await findGroupAvatarKey(groupId);
    if (!key) {
      throw new HttpError(404, "Group image not found");
    }
    await streamObjectToResponse(res, key, { inline: true });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};

export const removeGroupAvatar = async (
  req: Request,
  res: Response<{ ok: true } | ApiErrorResponse>,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new HttpError(401, "Authentication required");
    }

    const groupId = req.params.groupId as string;
    await removeGroupAvatarFiles(groupId);
    const group = await groupService.setImage(groupId, req.user.username, "");
    if (!group) {
      throw new HttpError(403, "Only the group creator can remove the group photo");
    }

    res.json({ ok: true });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw error;
  }
};
