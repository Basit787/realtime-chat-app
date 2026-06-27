import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, Phone, PhoneOff, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useDraggablePanel } from "@/lib/useDraggablePanel";
import { useCallTimer } from "@/lib/useCallTimer";
import { cn } from "@/lib/utils";
import { useChatRoom } from "@/pages/chat/context/ChatRoomContext";

const MINIMIZED_WIDTH = 288;
const MINIMIZED_HEIGHT = 72;
const AUDIO_WIDTH = 360;
const AUDIO_HEIGHT = 400;
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 520;

const MinimizedVideoPreview = ({ stream }: { stream: MediaStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (el) el.srcObject = stream;
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="h-10 w-14 shrink-0 rounded-lg object-cover"
    />
  );
};

const VideoTile = ({
  stream,
  label,
  muted,
  className,
}: {
  stream: MediaStream | null;
  label: string;
  muted?: boolean;
  className?: string;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = stream;
  }, [stream]);

  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-muted", className)}>
      {stream ? (
        <video ref={videoRef} autoPlay muted={muted} playsInline className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full min-h-[120px] items-center justify-center bg-muted">
          <UserAvatar name={label} className="h-16 w-16" />
        </div>
      )}
      <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] text-white">
        {label}
      </span>
    </div>
  );
};

const CallWindowHeader = ({
  title,
  subtitle,
  minimized,
  onToggleMinimize,
  onPointerDown,
  isDragging,
}: {
  title: string;
  subtitle?: string;
  minimized: boolean;
  onToggleMinimize: () => void;
  onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
  isDragging: boolean;
}) => (
  <div
    onPointerDown={onPointerDown}
    className={cn(
      "flex cursor-grab items-center justify-between gap-2 border-b border-border/60 bg-card/95 px-3 py-2 select-none",
      isDragging && "cursor-grabbing",
    )}
  >
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold">{title}</p>
      {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
    </div>
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      onClick={onToggleMinimize}
      aria-label={minimized ? "Maximize call" : "Minimize call"}
    >
      {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
    </Button>
  </div>
);

export const CallOverlay = () => {
  const {
    username: selfUsername,
    isGroup,
    inCall,
    groupLabel,
    room,
    remoteParticipants,
    dmCall,
    groupCall,
    actions,
  } = useChatRoom();

  const incomingCall = isGroup ? null : dmCall.incomingCall;
  const callPeer = dmCall.callPeer;
  const localStream = isGroup ? groupCall.localStream : dmCall.localStream;
  const remoteStream = dmCall.remoteStream;
  const groupHost = groupCall.roomCall?.host ?? groupCall.participants[0];
  const groupParticipants = groupCall.inGroupCall
    ? groupCall.participants
    : groupCall.roomCall?.participants ?? [];
  const incomingGroupCall = groupCall.roomCall
    ? {
        callType: groupCall.roomCall.callType,
        host: groupCall.roomCall.host,
        participants: groupCall.roomCall.participants,
      }
    : null;
  const groupCallType = groupCall.callType;

  const showDmIncoming = incomingCall && !inCall && !isGroup;
  const showGroupIncoming = incomingGroupCall && !inCall && isGroup;
  const visible = showDmIncoming || showGroupIncoming || inCall;

  const [minimized, setMinimized] = useState(false);
  const { label: durationLabel } = useCallTimer(inCall);

  const isVideo = isGroup
    ? inCall
      ? groupCallType === "video"
      : incomingGroupCall?.callType === "video"
    : (callPeer?.callType ?? incomingCall?.callType) === "video";

  const panelWidth = minimized ? MINIMIZED_WIDTH : isVideo ? VIDEO_WIDTH : AUDIO_WIDTH;
  const panelHeight = minimized ? MINIMIZED_HEIGHT : isVideo ? VIDEO_HEIGHT : AUDIO_HEIGHT;

  const { panelRef, position, isDragging, onPointerDown } = useDraggablePanel({
    enabled: visible,
    panelWidth,
    panelHeight,
  });

  useEffect(() => {
    if (!visible) setMinimized(false);
  }, [visible]);

  if (!visible || !position) return null;

  const dmPeerName = callPeer?.username ?? incomingCall?.username ?? "";
  const title = inCall
    ? isGroup
      ? groupLabel ?? "Group call"
      : dmPeerName
    : showGroupIncoming
      ? groupLabel ?? "Group call"
      : dmPeerName;

  const subtitle = inCall
    ? `${isVideo ? "Video" : "Audio"} · ${durationLabel}`
    : showGroupIncoming
      ? `${incomingGroupCall?.callType === "video" ? "Video" : "Audio"} · ${incomingGroupCall?.participants.length ?? 0} in call`
      : incomingCall
        ? `${incomingCall.callType === "video" ? "Video" : "Audio"} call`
        : undefined;

  const previewStream = isVideo
    ? remoteStream ?? remoteParticipants.find((p) => p.stream)?.stream ?? localStream ?? null
    : null;

  const content = (
    <div
      ref={panelRef}
      style={{ left: position.x, top: position.y, width: panelWidth }}
      className={cn(
        "fixed z-[200] overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl ring-1 ring-black/5",
        !isDragging && "transition-[width,height] duration-200",
      )}
    >
      <CallWindowHeader
        title={title}
        subtitle={minimized ? durationLabel || subtitle : subtitle}
        minimized={minimized}
        onToggleMinimize={() => setMinimized((m) => !m)}
        onPointerDown={onPointerDown}
        isDragging={isDragging}
      />

      {minimized ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setMinimized(false)}
          className="h-auto w-full justify-start gap-3 rounded-none px-3 py-2 font-normal"
          aria-label="Expand call window"
        >
          {isVideo && previewStream ? (
            <MinimizedVideoPreview stream={previewStream} />
          ) : (
            <UserAvatar
              name={isGroup ? groupLabel ?? "Group" : dmPeerName}
              className="h-10 w-10 shrink-0"
              showOnline={!isGroup}
              online
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{inCall ? durationLabel : "Incoming call"}</p>
          </div>
          {inCall ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="h-9 w-9 shrink-0 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                actions.endCall();
              }}
              aria-label="End call"
            >
              <PhoneOff className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex shrink-0 gap-1">
              {showDmIncoming && (
                <>
                  <Button
                    type="button"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      dmCall.acceptCall();
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      dmCall.rejectCall();
                    }}
                  >
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </>
              )}
              {showGroupIncoming && (
                <>
                  <Button
                    type="button"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      groupCall.joinGroupCall(room);
                    }}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      groupCall.dismissIncoming();
                    }}
                  >
                    <PhoneOff className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </Button>
      ) : (
        <div className="p-4">
          {showDmIncoming && incomingCall && (
            <div className="flex flex-col items-center gap-4 py-4">
              <UserAvatar name={incomingCall.username} className="h-20 w-20" showOnline online />
              <div className="text-center">
                <p className="text-lg font-semibold">{incomingCall.username}</p>
                <p className="text-sm text-muted-foreground">
                  Incoming {incomingCall.callType === "video" ? "video" : "audio"} call
                </p>
              </div>
              <div className="flex gap-3">
                <Button type="button" className="rounded-full px-6" onClick={() => dmCall.acceptCall()}>
                  <Phone className="mr-2 h-4 w-4" />
                  Accept
                </Button>
                <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => dmCall.rejectCall()}>
                  <PhoneOff className="mr-2 h-4 w-4" />
                  Decline
                </Button>
              </div>
            </div>
          )}

          {showGroupIncoming && incomingGroupCall && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15">
                {incomingGroupCall.callType === "video" ? (
                  <Video className="h-9 w-9 text-primary" />
                ) : (
                  <Phone className="h-9 w-9 text-primary" />
                )}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold">{groupLabel}</p>
                <p className="text-sm text-muted-foreground">
                  {incomingGroupCall.callType === "video" ? "Group video call" : "Group audio call"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Started by {incomingGroupCall.host} · {incomingGroupCall.participants.length} in call
                </p>
              </div>
              <div className="flex gap-3">
                <Button type="button" className="rounded-full px-6" onClick={() => groupCall.joinGroupCall(room)}>
                  Join call
                </Button>
                <Button type="button" variant="outline" className="rounded-full px-6" onClick={() => groupCall.dismissIncoming()}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {inCall && isGroup && (
            <>
              {isVideo ? (
                <div className="grid max-h-[340px] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                  <VideoTile stream={localStream ?? null} label="You" muted className="aspect-video" />
                  {remoteParticipants.map(({ username, stream }) => (
                    <VideoTile key={username} stream={stream} label={username} className="aspect-video" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-6">
                  <div className="flex flex-wrap justify-center gap-2">
                    <UserAvatar name="You" className="h-14 w-14 ring-2 ring-primary/30" />
                    {groupParticipants
                      .filter((name) => name !== selfUsername)
                      .map((name) => (
                        <UserAvatar key={name} name={name} className="h-14 w-14" />
                      ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {groupParticipants.length} participant{groupParticipants.length === 1 ? "" : "s"}
                    {groupHost ? ` · Host: ${groupHost}` : ""}
                  </p>
                </div>
              )}
              <div className="mt-4 flex justify-center">
                <Button type="button" variant="destructive" className="rounded-full px-8" onClick={actions.endCall}>
                  <PhoneOff className="mr-2 h-4 w-4" />
                  Leave call
                </Button>
              </div>
            </>
          )}

          {inCall && !isGroup && callPeer && (
            <>
              {callPeer.callType === "video" ? (
                <div className="relative">
                  <VideoTile
                    stream={remoteStream ?? null}
                    label={callPeer.username}
                    className="aspect-video w-full"
                  />
                  <div className="absolute right-3 top-3 w-28 overflow-hidden rounded-lg shadow-lg ring-2 ring-background">
                    <VideoTile stream={localStream ?? null} label="You" muted className="aspect-[3/4]" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-8">
                  <UserAvatar name={callPeer.username} className="h-24 w-24" showOnline online />
                  <div className="text-center">
                    <p className="text-lg font-semibold">{callPeer.username}</p>
                    <p className="text-sm text-muted-foreground">Audio call · {durationLabel}</p>
                  </div>
                </div>
              )}
              <div className="mt-4 flex justify-center">
                <Button type="button" variant="destructive" className="h-12 w-12 rounded-full p-0" onClick={actions.endCall}>
                  <PhoneOff className="h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );

  return createPortal(content, document.body);
};
