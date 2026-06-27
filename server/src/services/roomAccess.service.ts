import { canAccessRoom as canAccessRoomSync } from "../utils/room.js";
import { groupService } from "./group.service.js";

export const canAccessRoom = async (room: string, username: string): Promise<boolean> => {
  if (canAccessRoomSync(room, username)) return true;
  if (room.startsWith("group..")) return groupService.isMember(room, username);
  return false;
};
