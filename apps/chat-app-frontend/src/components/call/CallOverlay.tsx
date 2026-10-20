import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  Phone,
  PhoneOff,
  SwitchCamera,
  Video,
  VideoOff,
} from "lucide-react";
import { Button } from "pui";
import { UserAvatar } from "@/components/avatar/user-avatar";
import { GroupAvatar } from "@/components/avatar/group-avatar";
import { useDraggablePanel, useCallTimer, MOBILE_LAYOUT_QUERY, useMediaQuery } from "frontend-common";
import { useIncomingCallAlerts } from "@/lib/useIncomingCallAlerts";
import { useUserProfileImage } from "@/lib/use-user-profile-image";
import { startRingback } from "@/lib/call-sounds";
import { CallAudioStream } from "@/components/call/CallAudioStream";
import { cn } from "@/lib/utils";
import { useChatRoom } from "@/features/chat/context/use-chat-room";
import { useChatStore } from "@/features/chat/store/chat-store";
import type { ChatGroup } from "@/features/chat/api/api";

const MINIMIZED_WIDTH = 288;
const MINIMIZED_HEIGHT = 72;
const AUDIO_WIDTH = 360;
const AUDIO_HEIGHT = 520;
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 540;
/** Height of the "return to call" bar shown on phones while the call is minimized */
const MOBILE_CALL_BAR_HEIGHT = "40px";

const RINGING_LABELS: Record<string, string> = { calling: "Calling…", ringing: "Ringing…" };

const CALL_GREEN = "bg-[#25d366] text-white hover:bg-[#1fb855]";
const CALL_RED = "bg-[#ea0038] text-white hover:bg-[#c8002f]";

/** Video element bound to a stream. Always muted: call audio is played by CallAudioStream. */
const StreamVideo = ({
  stream,
  className,
  mirrored,
}: {
  stream: MediaStream;
  className?: string;
  mirrored?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = stream;
    void el.play().catch(() => {});
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={cn("h-full w-full object-cover", mirrored && "-scale-x-100", className)}
    />
  );
};

type AvatarProps = { name: string; className?: string; fallbackClassName?: string };

const PeerAvatar = ({ name, ...sizing }: AvatarProps) => (
  <UserAvatar name={name} imageUrl={useUserProfileImage(name)} {...sizing} />
);

const CallerAvatar = ({ group, name, ...sizing }: AvatarProps & { group?: ChatGroup }) =>
  group ? (
    <GroupAvatar groupId={group.id} name={group.name} imageUrl={group.image} {...sizing} />
  ) : (
    <PeerAvatar name={name} {...sizing} />
  );

/** One participant tile in the group call grid, labelled with their name. */
const GridTile = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="relative flex aspect-3/4 items-center justify-center overflow-hidden rounded-xl bg-[#1f2c34] sm:aspect-video">
    {children}
    <span className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px]">{label}</span>
  </div>
);

const RoundButton = ({
  label,
  onClick,
  className,
  children,
  caption,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
  caption?: string;
}) => (
  <div className="flex flex-col items-center gap-1.5">
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "flex h-14 w-14 items-center justify-center rounded-full transition-colors active:scale-95",
        className ?? "bg-white/15 text-white hover:bg-white/25",
      )}
    >
      {children}
    </button>
    {caption && <span className="text-xs text-white/80">{caption}</span>}
  </div>
);

type CallControlsProps = {
  isVideo: boolean;
  micMuted: boolean;
  cameraOff: boolean;
  canSwitchCamera: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onSwitchCamera: () => void;
  onEnd: () => void;
};

const CallControls = ({
  isVideo,
  micMuted,
  cameraOff,
  canSwitchCamera,
  onToggleMic,
  onToggleCamera,
  onSwitchCamera,
  onEnd,
}: CallControlsProps) => (
  <div className="mx-auto flex w-full max-w-sm items-center justify-evenly rounded-3xl bg-[#1f2c34]/90 px-3 py-3 backdrop-blur">
    {isVideo && (
      <>
        {canSwitchCamera && (
          <RoundButton label="Switch camera" onClick={onSwitchCamera}>
            <SwitchCamera className="h-6 w-6" />
          </RoundButton>
        )}
        <RoundButton
          label={cameraOff ? "Turn camera on" : "Turn camera off"}
          onClick={onToggleCamera}
          className={cameraOff ? "bg-white text-[#0b141a]" : undefined}
        >
          {cameraOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
        </RoundButton>
      </>
    )}
    <RoundButton
      label={micMuted ? "Unmute" : "Mute"}
      onClick={onToggleMic}
      className={micMuted ? "bg-white text-[#0b141a]" : undefined}
    >
      {micMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
    </RoundButton>
    <RoundButton label="End call" onClick={onEnd} className={CALL_RED}>
      <PhoneOff className="h-6 w-6" />
    </RoundButton>
  </div>
);

type CallScreenProps = {
  title: string;
  status: string;
  group?: ChatGroup;
  onMinimize?: () => void;
  /** Replaces the big avatar in the middle (e.g. a group video grid) */
  children?: ReactNode;
  /** Full-bleed layer behind everything (remote video) */
  background?: ReactNode;
  /** Floating layer above everything (self-view) */
  pip?: ReactNode;
  footer: ReactNode;
};

/** WhatsApp-style dark call layout: name and status on top, avatar or video in the middle, controls at the bottom. */
const CallScreen = ({ title, status, group, onMinimize, children, background, pip, footer }: CallScreenProps) => (
  <div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0b141a] text-white">
    {background && (
      <>
        <div className="absolute inset-0">{background}</div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-black/60 to-transparent" />
      </>
    )}

    <div className="relative z-10 flex items-start gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
      {onMinimize && (
        <button
          type="button"
          onClick={onMinimize}
          aria-label="Minimize call"
          className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      )}
      <div className={cn("min-w-0 flex-1 text-center", onMinimize && "pr-9")}>
        <p className="truncate text-2xl font-medium">{title}</p>
        <p className="mt-1 text-sm tabular-nums text-white/70">{status}</p>
      </div>
    </div>

    <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center p-4">
      {children ??
        (!background && <CallerAvatar group={group} name={title} className="h-36 w-36" fallbackClassName="text-5xl" />)}
    </div>

    {pip}

    <div className="relative z-10 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">{footer}</div>
  </div>
);

const IncomingActions = ({
  onAccept,
  onDecline,
  isVideo,
  acceptLabel,
}: {
  onAccept: () => void;
  onDecline: () => void;
  isVideo: boolean;
  acceptLabel: string;
}) => (
  <div className="mx-auto flex max-w-xs items-center justify-between px-6">
    <RoundButton label="Decline" caption="Decline" onClick={onDecline} className={cn("h-16 w-16", CALL_RED)}>
      <PhoneOff className="h-7 w-7" />
    </RoundButton>
    <RoundButton
      label={acceptLabel}
      caption={acceptLabel}
      onClick={onAccept}
      className={cn("h-16 w-16 animate-pulse", CALL_GREEN)}
    >
      {isVideo ? <Video className="h-7 w-7" /> : <Phone className="h-7 w-7" />}
    </RoundButton>
  </div>
);

export const CallOverlay = () => {
  const { username: selfUsername, remoteParticipants, dmCall, groupCall, actions } = useChatRoom();
  const groups = useChatStore((s) => s.groups);
  const isMobile = useMediaQuery(MOBILE_LAYOUT_QUERY);

  const dmIncoming = dmCall.incomingCall;
  const dmInCall = dmCall.inCall;
  const groupIncoming = groupCall.roomCall;
  const groupInCall = groupCall.inGroupCall;

  const inActiveCall = dmInCall || groupInCall;
  const showDmIncoming = !!dmIncoming && !inActiveCall;
  const showGroupIncoming = !!groupIncoming && !inActiveCall && !dmIncoming;
  const isGroupCall = groupInCall || showGroupIncoming;
  const visible = showDmIncoming || showGroupIncoming || inActiveCall;

  const groupRoom = groupInCall ? groupCall.activeRoom : groupIncoming?.room;
  const group = groups.find((g) => g.room === groupRoom);
  const groupLabel = group?.name ?? "Group call";

  const callPeer = dmCall.callPeer;
  const localStream = groupInCall ? groupCall.localStream : dmCall.localStream;
  const remoteStream = dmCall.remoteStream;
  const groupCallType = groupInCall ? groupCall.callType : (groupIncoming?.callType ?? "audio");
  const dmStatus = dmCall.callStatus;
  const connected = groupInCall || (dmInCall && dmStatus === "connected");
  const outgoingRinging = dmInCall && (dmStatus === "calling" || dmStatus === "ringing");

  const [minimized, setMinimized] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const { label: durationLabel } = useCallTimer(connected);

  const isVideo = (isGroupCall ? groupCallType : (callPeer?.callType ?? dmIncoming?.callType)) === "video";

  const panelWidth = minimized ? MINIMIZED_WIDTH : isVideo ? VIDEO_WIDTH : AUDIO_WIDTH;
  const panelHeight = minimized ? MINIMIZED_HEIGHT : isVideo ? VIDEO_HEIGHT : AUDIO_HEIGHT;

  const { panelRef, position, isDragging, onPointerDown } = useDraggablePanel({
    enabled: visible && !isMobile,
    panelWidth,
    panelHeight,
  });

  const alertTitle = showDmIncoming
    ? `Call from ${dmIncoming?.username ?? "someone"}`
    : showGroupIncoming
      ? `Group call in ${groupLabel}`
      : "";
  const alertBody = showDmIncoming
    ? `Incoming ${dmIncoming?.callType === "video" ? "video" : "voice"} call`
    : showGroupIncoming
      ? `Started by ${groupIncoming?.host ?? "someone"}`
      : "";

  useIncomingCallAlerts(showDmIncoming || showGroupIncoming, alertTitle, alertBody);

  useEffect(() => {
    if (outgoingRinging) return startRingback();
  }, [outgoingRinging]);

  useEffect(() => {
    if (!visible) setMinimized(false);
  }, [visible]);

  useEffect(() => {
    if (inActiveCall) return;
    setMicMuted(false);
    setCameraOff(false);
  }, [inActiveCall]);

  // Re-applied whenever the stream changes (e.g. after switching camera)
  useEffect(() => {
    localStream?.getAudioTracks().forEach((track) => (track.enabled = !micMuted));
    localStream?.getVideoTracks().forEach((track) => (track.enabled = !cameraOff));
  }, [localStream, micMuted, cameraOff]);

  // On phones a minimized call becomes a bar above the app; reserve room for it so it doesn't cover the header
  const showMobileBar = visible && isMobile && minimized && inActiveCall;
  useEffect(() => {
    document.documentElement.style.setProperty("--call-bar-h", showMobileBar ? MOBILE_CALL_BAR_HEIGHT : "0px");
    return () => document.documentElement.style.setProperty("--call-bar-h", "0px");
  }, [showMobileBar]);

  if (!visible) return null;

  const dmPeerName = callPeer?.username ?? dmIncoming?.username ?? "";
  const title = isGroupCall ? groupLabel : dmPeerName;
  const callKind = isVideo ? "video" : "voice";

  const status = showDmIncoming
    ? `Incoming ${callKind} call`
    : showGroupIncoming
      ? `Group ${callKind} call · ${groupIncoming?.participants.length ?? 0} in call`
      : outgoingRinging
        ? RINGING_LABELS[dmStatus]
        : durationLabel;

  const controls = (
    <CallControls
      isVideo={isVideo}
      micMuted={micMuted}
      cameraOff={cameraOff}
      canSwitchCamera={isMobile}
      onToggleMic={() => setMicMuted((m) => !m)}
      onToggleCamera={() => setCameraOff((c) => !c)}
      onSwitchCamera={() => void (groupInCall ? groupCall.switchCamera() : dmCall.switchCamera())}
      onEnd={actions.endCall}
    />
  );

  const onMinimize = isMobile && inActiveCall ? () => setMinimized(true) : undefined;

  let screen: ReactNode = null;
  if (showDmIncoming && dmIncoming) {
    screen = (
      <CallScreen
        title={title}
        status={status}
        footer={
          <IncomingActions
            isVideo={dmIncoming.callType === "video"}
            acceptLabel="Accept"
            onAccept={actions.acceptIncomingDmCall}
            onDecline={dmCall.rejectCall}
          />
        }
      />
    );
  } else if (showGroupIncoming && groupIncoming) {
    screen = (
      <CallScreen
        title={title}
        status={status}
        group={group}
        footer={
          <IncomingActions
            isVideo={groupIncoming.callType === "video"}
            acceptLabel="Join"
            onAccept={actions.acceptIncomingGroupCall}
            onDecline={groupCall.dismissIncoming}
          />
        }
      />
    );
  } else if (dmInCall && callPeer) {
    const remoteVideo = isVideo && connected && remoteStream?.getVideoTracks().length ? remoteStream : null;
    screen = (
      <CallScreen
        title={title}
        status={status}
        onMinimize={onMinimize}
        background={remoteVideo && <StreamVideo stream={remoteVideo} />}
        pip={
          isVideo &&
          localStream &&
          !cameraOff && (
            <div className="absolute right-4 top-24 z-20 aspect-3/4 w-28 overflow-hidden rounded-xl shadow-lg ring-1 ring-white/20 sm:w-32">
              <StreamVideo stream={localStream} mirrored />
            </div>
          )
        }
        footer={controls}
      />
    );
  } else if (groupInCall) {
    const others = groupCall.participants.filter((name) => name !== selfUsername);
    screen = (
      <CallScreen
        title={title}
        status={`${status} · ${groupCall.participants.length} in call`}
        group={group}
        onMinimize={onMinimize}
        footer={controls}
      >
        <div className={cn("grid max-h-full w-full gap-2 overflow-y-auto", others.length > 0 && "grid-cols-2")}>
          {isVideo && localStream && (
            <GridTile label="You">{!cameraOff && <StreamVideo stream={localStream} mirrored />}</GridTile>
          )}
          {others.map((name) => {
            const stream = remoteParticipants.find((p) => p.username === name)?.stream;
            return (
              <GridTile key={name} label={name}>
                {isVideo && stream?.getVideoTracks().length ? (
                  <StreamVideo stream={stream} />
                ) : (
                  <PeerAvatar name={name} className="h-20 w-20" fallbackClassName="text-2xl" />
                )}
              </GridTile>
            );
          })}
        </div>
      </CallScreen>
    );
  }

  // Remote audio lives outside the visible UI so minimizing the call or showing video never cuts it off
  const audio = (
    <>
      {dmInCall && <CallAudioStream stream={remoteStream} />}
      {groupInCall &&
        remoteParticipants.map(({ username, stream }) => <CallAudioStream key={username} stream={stream} />)}
    </>
  );

  if (isMobile) {
    return createPortal(
      <>
        {audio}
        {showMobileBar ? (
          <button
            type="button"
            onClick={() => setMinimized(false)}
            style={{ height: MOBILE_CALL_BAR_HEIGHT }}
            className="fixed inset-x-0 top-0 z-200 flex items-center justify-center gap-2 bg-[#25d366] text-sm font-medium text-[#0b141a]"
          >
            {isVideo ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
            Tap to return to call · <span className="tabular-nums">{status}</span>
          </button>
        ) : (
          <div className="fixed inset-0 z-200" role="dialog" aria-label={`Call with ${title}`}>
            {screen}
          </div>
        )}
      </>,
      document.body,
    );
  }

  const panelPosition = position ?? {
    x: Math.max(0, (window.innerWidth - panelWidth) / 2),
    y: Math.max(16, (window.innerHeight - panelHeight) / 4),
  };

  return createPortal(
    <>
      {audio}
      <div
        ref={panelRef}
        style={{
          left: panelPosition.x,
          top: panelPosition.y,
          width: panelWidth,
          height: minimized ? undefined : panelHeight,
        }}
        className={cn(
          "fixed z-200 flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b141a] text-white shadow-2xl",
          !isDragging && "transition-[width,height] duration-200",
        )}
      >
        <div
          onPointerDown={onPointerDown}
          className={cn(
            "flex cursor-grab touch-none items-center justify-between gap-2 border-b border-white/10 px-3 py-2 select-none",
            isDragging && "cursor-grabbing",
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <CallerAvatar group={isGroupCall ? group : undefined} name={title} className="h-8 w-8" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{title}</p>
              <p className="truncate text-xs tabular-nums text-white/60">{status}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
            {minimized && inActiveCall && (
              <Button
                type="button"
                size="icon"
                className={cn("h-8 w-8 rounded-full", CALL_RED)}
                onClick={actions.endCall}
                aria-label="End call"
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-white hover:bg-white/10 hover:text-white"
              onClick={() => setMinimized((m) => !m)}
              aria-label={minimized ? "Maximize call" : "Minimize call"}
            >
              {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!minimized && <div className="min-h-0 flex-1">{screen}</div>}
      </div>
    </>,
    document.body,
  );
};
