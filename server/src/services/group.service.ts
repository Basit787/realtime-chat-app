import { ChatGroup, type ChatGroupDocument } from "../models/ChatGroup.js";
import type { ChatGroupDto } from "../types/api.js";
import { groupRoomName, parseGroupRoom } from "../utils/room.js";

const toDto = (doc: ChatGroupDocument): ChatGroupDto => {
  const id = doc._id.toString();
  return {
    id,
    name: doc.name,
    description: doc.description ?? "",
    image: doc.image ?? "",
    room: groupRoomName(id),
    members: doc.members,
    createdBy: doc.createdBy,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

const listForUser = async (username: string): Promise<ChatGroupDto[]> => {
  const groups = await ChatGroup.find({ members: username }).sort({ updatedAt: -1 });
  return groups.map(toDto);
};

const getById = async (groupId: string, username: string): Promise<ChatGroupDto | null> => {
  const group = await ChatGroup.findById(groupId);
  if (!group || !group.members.includes(username)) return null;
  return toDto(group);
};

const create = async (
  name: string,
  members: string[],
  createdBy: string,
  description = "",
): Promise<ChatGroupDto> => {
  const uniqueMembers = [...new Set([createdBy, ...members])];
  const doc = await ChatGroup.create({
    name: name.trim(),
    description: description.trim(),
    members: uniqueMembers,
    createdBy,
  });
  return toDto(doc);
};

const update = async (
  groupId: string,
  username: string,
  data: { name?: string; description?: string; image?: string },
): Promise<ChatGroupDto | null> => {
  const group = await ChatGroup.findById(groupId);
  if (!group || !group.members.includes(username)) return null;
  if (group.createdBy !== username) return null;

  if (data.name !== undefined) group.name = data.name.trim();
  if (data.description !== undefined) group.description = data.description.trim();
  if (data.image !== undefined) group.image = data.image;

  await group.save();
  return toDto(group);
};

const setImage = async (groupId: string, username: string, image: string): Promise<ChatGroupDto | null> =>
  update(groupId, username, { image });

const isMember = async (room: string, username: string): Promise<boolean> => {
  const id = parseGroupRoom(room);
  if (!id) return false;
  const group = await ChatGroup.findById(id).select("members").lean();
  return group?.members.includes(username) ?? false;
};

const getMembersForRoom = async (room: string): Promise<string[] | null> => {
  const id = parseGroupRoom(room);
  if (!id) return null;
  const group = await ChatGroup.findById(id).select("members").lean();
  return group?.members ?? null;
};

export const groupService = {
  listForUser,
  getById,
  create,
  update,
  setImage,
  isMember,
  getMembersForRoom,
};
