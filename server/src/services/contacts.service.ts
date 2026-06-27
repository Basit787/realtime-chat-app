import type { Connection } from "mongoose";
import { ChatGroup } from "../models/ChatGroup.js";
import { CallHistory } from "../models/CallHistory.js";
import { Message } from "../models/Message.js";
import { parseDmRoom } from "../utils/room.js";

export const createContactsService = (connection: Connection) => {
  const getKnownContacts = async (username: string): Promise<string[]> => {
    const peers = new Set<string>();

    const dmMessages = await Message.find({ room: /^dm\.\./ }).select("room").lean();
    for (const message of dmMessages) {
      const participants = parseDmRoom(message.room);
      if (!participants || !participants.includes(username)) continue;
      const peer = participants[0] === username ? participants[1] : participants[0];
      peers.add(peer);
    }

    const calls = await CallHistory.find({
      $or: [{ caller: username }, { callee: username }],
    })
      .select("caller callee")
      .lean();

    for (const call of calls) {
      peers.add(call.caller === username ? call.callee : call.caller);
    }

    const groups = await ChatGroup.find({ members: username }).select("members").lean();
    for (const group of groups) {
      for (const member of group.members) {
        if (member !== username) peers.add(member);
      }
    }

    const allUsers = await connection.db().collection("user").find({}, { projection: { name: 1 } }).toArray();
    for (const user of allUsers) {
      const name = user.name as string | undefined;
      if (name && name !== username) peers.add(name);
    }

    peers.delete(username);
    return [...peers].sort((a, b) => a.localeCompare(b));
  };

  return { getKnownContacts };
};

export type ContactsService = ReturnType<typeof createContactsService>;
