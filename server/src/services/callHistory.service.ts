import { CallHistory, type CallStatus, type CallType } from "../models/CallHistory.js";
import type { CallHistoryDto } from "../types/api.js";

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

const finalizeCall = async (
  caller: string,
  callee: string,
  status: CallStatus,
): Promise<CallHistoryDto | null> => {
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
