import type { CallType } from "../types/socket.js";

export type GroupCallState = {
  room: string;
  callType: CallType;
  host: string;
  participants: string[];
};

const calls = new Map<string, { callType: CallType; host: string; participants: Set<string> }>();

const toState = (room: string): GroupCallState | null => {
  const call = calls.get(room);
  if (!call) return null;
  return {
    room,
    callType: call.callType,
    host: call.host,
    participants: [...call.participants],
  };
};

export const groupCallService = {
  start: (room: string, host: string, callType: CallType): GroupCallState | null => {
    if (calls.has(room)) return null;
    calls.set(room, { callType, host, participants: new Set([host]) });
    return toState(room);
  },

  join: (room: string, username: string): GroupCallState | null => {
    const call = calls.get(room);
    if (!call) return null;
    call.participants.add(username);
    return toState(room);
  },

  leave: (room: string, username: string): GroupCallState | null => {
    const call = calls.get(room);
    if (!call) return null;
    call.participants.delete(username);
    if (call.participants.size === 0) {
      calls.delete(room);
      return null;
    }
    return toState(room);
  },

  get: (room: string): GroupCallState | null => toState(room),

  removeUserFromAll: (username: string): GroupCallState[] => {
    const updates: GroupCallState[] = [];
    for (const room of [...calls.keys()]) {
      const call = calls.get(room);
      if (!call?.participants.has(username)) continue;
      call.participants.delete(username);
      if (call.participants.size === 0) {
        calls.delete(room);
        updates.push({ room, callType: call.callType, host: call.host, participants: [] });
      } else {
        const state = toState(room);
        if (state) updates.push(state);
      }
    }
    return updates;
  },
};
