import mongoose from "mongoose";

export type CallType = "audio" | "video";
export type CallStatus = "completed" | "missed" | "rejected" | "cancelled";

export interface ICallHistory {
  caller: string;
  callee: string;
  callType: CallType;
  status: CallStatus;
  startedAt: Date;
  endedAt: Date;
  durationSeconds?: number;
}

const callHistorySchema = new mongoose.Schema<ICallHistory>(
  {
    caller: { type: String, required: true, index: true },
    callee: { type: String, required: true, index: true },
    callType: { type: String, enum: ["audio", "video"], required: true },
    status: { type: String, enum: ["completed", "missed", "rejected", "cancelled"], required: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    durationSeconds: { type: Number, required: false },
  },
  { timestamps: false },
);

callHistorySchema.index({ caller: 1, startedAt: -1 });
callHistorySchema.index({ callee: 1, startedAt: -1 });

export const CallHistory = mongoose.model<ICallHistory>("CallHistory", callHistorySchema);
