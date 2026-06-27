import type { Server } from "socket.io";
import { groupService } from "../services/group.service.js";
import { parseDmRoom } from "../utils/room.js";

const GENERAL_ROOM = "general";

export const userRoom = (username: string) => `user:${username}`;

export const emitToRoomParticipants = async (
  io: Server,
  room: string,
  event: string,
  payload: unknown,
): Promise<void> => {
  if (room === GENERAL_ROOM) {
    io.to(GENERAL_ROOM).emit(event, payload);
    return;
  }

  const dm = parseDmRoom(room);
  if (dm) {
    for (const participant of dm) {
      io.to(userRoom(participant)).emit(event, payload);
    }
    return;
  }

  const members = await groupService.getMembersForRoom(room);
  if (members) {
    for (const member of members) {
      io.to(userRoom(member)).emit(event, payload);
    }
  }
};
