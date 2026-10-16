import { CallHistory, type CallStatus, type CallType } from "./call.model.js";
import type { CallHistoryDto, WebRTCConfigResponse } from "../../types/api.js";
import { config } from "../../config/index.js";

type ActiveCall = {
  caller: string;
  callee: string;
  callType: CallType;
  startedAt: Date;
  answeredAt: Date | null;
};

const activeCalls = new Map<string, ActiveCall>();

const pairKey = (a: string, b: string) => [a, b].sort().join("..");

const toDto = (doc: {
  _id: { toString(): string };
  caller: string;
  callee: string;
  callType: CallType;
  status: CallStatus;
  startedAt: Date;
  endedAt: Date;
  durationSeconds?: number;
}): CallHistoryDto => ({
  id: doc._id.toString(),
  caller: doc.caller,
  callee: doc.callee,
  callType: doc.callType,
  status: doc.status,
  startedAt: doc.startedAt.toISOString(),
  endedAt: doc.endedAt.toISOString(),
  durationSeconds: doc.durationSeconds,
});

const finalizeCall = async (caller: string, callee: string, status: CallStatus): Promise<CallHistoryDto | null> => {
  const key = pairKey(caller, callee);
  const call = activeCalls.get(key);
  if (!call) return null;

  const endedAt = new Date();
  let durationSeconds: number | undefined;
  if (call.answeredAt && status === "completed") {
    durationSeconds = Math.max(0, Math.round((endedAt.getTime() - call.answeredAt.getTime()) / 1000));
  }

  const doc = await CallHistory.create({
    caller: call.caller,
    callee: call.callee,
    callType: call.callType,
    status,
    startedAt: call.startedAt,
    endedAt,
    durationSeconds,
  });

  activeCalls.delete(key);
  return toDto(doc);
};

export const callHistoryService = {
  trackInvite: (caller: string, callee: string, callType: CallType) => {
    activeCalls.set(pairKey(caller, callee), {
      caller,
      callee,
      callType,
      startedAt: new Date(),
      answeredAt: null,
    });
  },

  trackAnswer: (caller: string, callee: string) => {
    const call = activeCalls.get(pairKey(caller, callee));
    if (call) call.answeredAt = new Date();
  },

  recordEnd: async (userA: string, userB: string): Promise<CallHistoryDto | null> => {
    const call = activeCalls.get(pairKey(userA, userB));
    if (!call) return null;
    const status: CallStatus = call.answeredAt ? "completed" : "cancelled";
    return finalizeCall(call.caller, call.callee, status);
  },

  recordReject: async (caller: string, callee: string): Promise<CallHistoryDto | null> =>
    finalizeCall(caller, callee, "rejected"),

  getUserHistory: async (username: string, peer?: string, limit = 50): Promise<CallHistoryDto[]> => {
    const filter: Record<string, unknown> = {
      $or: [{ caller: username }, { callee: username }],
    };
    if (peer) {
      filter.$or = [
        { caller: username, callee: peer },
        { caller: peer, callee: username },
      ];
    }

    const records = await CallHistory.find(filter).sort({ startedAt: -1 }).limit(limit).lean();
    return records.map((doc) =>
      toDto({
        _id: { toString: () => String(doc._id) },
        caller: doc.caller,
        callee: doc.callee,
        callType: doc.callType,
        status: doc.status,
        startedAt: doc.startedAt,
        endedAt: doc.endedAt,
        durationSeconds: doc.durationSeconds,
      }),
    );
  },
};

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

const getIceServers = (): WebRTCConfigResponse => {
  const host = config.turnHost;
  const port = config.turnPort;
  return {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: `stun:${host}:${port}` },
      {
        urls: `turn:${host}:${port}`,
        username: config.turnUser,
        credential: config.turnPassword,
      },
    ],
  };
};

export const webRTCService = { getIceServers };
