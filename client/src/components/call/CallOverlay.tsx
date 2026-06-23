import { Button } from "@/components/ui/button";
import type { CallType } from "@/lib/api";

type CallPeer = { username: string; callType: CallType };

type CallOverlayProps = {
  incomingCall: CallPeer | null;
  inCall: boolean;
  callPeer: CallPeer | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
};

export function CallOverlay({
  incomingCall,
  inCall,
  callPeer,
  localStream,
  remoteStream,
  onAccept,
  onReject,
  onEnd,
}: CallOverlayProps) {
  const localVideoRef = (el: HTMLVideoElement | null) => {
    if (el) el.srcObject = localStream;
  };
  const remoteVideoRef = (el: HTMLVideoElement | null) => {
    if (el) el.srcObject = remoteStream;
  };

  if (!incomingCall && !inCall) return null;

  return (
    <div className="absolute inset-x-0 top-[73px] z-20 mx-5 rounded-xl border border-border/60 bg-card/95 p-4 backdrop-blur-sm">
      {incomingCall && !inCall && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm">
            Incoming {incomingCall.callType} call from <strong>{incomingCall.username}</strong>
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={onAccept}>
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={onReject}>
              Reject
            </Button>
          </div>
        </div>
      )}

      {inCall && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium">In call with {callPeer?.username}</p>
            <Button size="sm" variant="destructive" onClick={onEnd}>
              End call
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <video ref={localVideoRef} autoPlay muted playsInline className="aspect-video rounded-lg bg-black" />
            <video ref={remoteVideoRef} autoPlay playsInline className="aspect-video rounded-lg bg-black" />
          </div>
        </>
      )}
    </div>
  );
}
