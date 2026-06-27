import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { useChat } from "@/pages/chat/api/hooks";
import { useSocket } from "@/lib/useSocket";
import { useWebRTC } from "@/lib/useWebRTC";
import { useGroupWebRTC } from "@/lib/useGroupWebRTC";
import { conversationToRoom, isDmConversation, isGroupRoom } from "@/lib/rooms";
import { callsForConversation, messagesForConversation, useChatStore } from "@/pages/chat/store/chat-store";
import { useAuthStore } from "@/pages/auth/store/auth-store";
import type { CallHistoryEntry, ChatGroup, ChatMessage } from "@/pages/chat/api/api";

type RemoteParticipant = {
  username: string;
  stream: MediaStream | null;
};

type ChatRoomActions = {
  startAudioCall: () => void;
  startVideoCall: () => void;
  endCall: () => void;
  openGroupInfo: () => void;
  closeGroupInfo: () => void;
};

type ChatRoomContextValue = {
  username: string;
  socket: Socket | null;
  room: string;
  activeConversationId: string;
  isDm: boolean;
  isGroup: boolean;
  inCall: boolean;
  groupLabel: string;
  activeGroup: ChatGroup | undefined;
  showGroupInfo: boolean;
  groupInfoOpen: boolean;
  visibleMessages: ChatMessage[];
  visibleCalls: CallHistoryEntry[];
  remoteParticipants: RemoteParticipant[];
  dmCall: ReturnType<typeof useWebRTC>;
  groupCall: ReturnType<typeof useGroupWebRTC>;
  actions: ChatRoomActions;
  bottomRef: React.RefObject<HTMLDivElement | null>;
};

const ChatRoomContext = createContext<ChatRoomContextValue | null>(null);

export const useChatRoom = () => {
  const value = useContext(ChatRoomContext);
  if (!value) {
    throw new Error("useChatRoom must be used within ChatRoomProvider");
  }
  return value;
};

export const ChatRoomProvider = ({ children }: { children: ReactNode }) => {
  const username = useAuthStore((s) => s.username);
  const messages = useChatStore((s) => s.messages);
  const callHistory = useChatStore((s) => s.callHistory);
  const groups = useChatStore((s) => s.groups);
  const hiddenMessageIds = useChatStore((s) => s.hiddenMessageIds);
  const activeConversationId = useChatStore((s) => s.activeConversationId);

  const room = conversationToRoom(activeConversationId, username);
  const isDm = isDmConversation(activeConversationId);
  const isGroup = !isDm;

  useChat();
  const socket = useSocket();
  const dmCall = useWebRTC({ socket, selfUsername: username, enabled: !!socket && isDm });
  const groupCall = useGroupWebRTC({ socket, selfUsername: username, room, enabled: !!socket && isGroup });

  const bottomRef = useRef<HTMLDivElement>(null);
  const prevConversationRef = useRef(activeConversationId);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);

  const visibleMessages = useMemo(
    () => messagesForConversation(messages, activeConversationId, username, hiddenMessageIds),
    [messages, activeConversationId, username, hiddenMessageIds],
  );

  const visibleCalls = useMemo(
    () => callsForConversation(callHistory, activeConversationId, username),
    [callHistory, activeConversationId, username],
  );

  const callPeer = isDm ? activeConversationId : null;
  const inCall = dmCall.inCall || groupCall.inGroupCall;

  const remoteParticipants = useMemo(
    () =>
      [...groupCall.remoteStreams.entries()].map(([name, stream]) => ({
        username: name,
        stream,
      })),
    [groupCall.remoteStreams],
  );

  const activeGroup = groups.find((g) => g.room === activeConversationId);
  const groupLabel = activeConversationId === "general" ? "# General" : activeGroup?.name ?? activeConversationId;
  const showGroupInfo = isGroupRoom(activeConversationId) && !!activeGroup;

  const startAudioCall = useCallback(() => {
    if (isDm && callPeer) {
      dmCall.startCall(callPeer, "audio");
      return;
    }
    if (groupCall.roomCall) {
      groupCall.joinGroupCall(room);
      return;
    }
    groupCall.startGroupCall(room, "audio");
  }, [callPeer, dmCall, groupCall, isDm, room]);

  const startVideoCall = useCallback(() => {
    if (isDm && callPeer) {
      dmCall.startCall(callPeer, "video");
      return;
    }
    if (groupCall.roomCall) {
      groupCall.joinGroupCall(room);
      return;
    }
    groupCall.startGroupCall(room, "video");
  }, [callPeer, dmCall, groupCall, isDm, room]);

  const endCall = useCallback(() => {
    if (dmCall.inCall) dmCall.endCall();
    if (groupCall.inGroupCall) groupCall.leaveGroupCall();
  }, [dmCall, groupCall]);

  const openGroupInfo = useCallback(() => setGroupInfoOpen(true), []);
  const closeGroupInfo = useCallback(() => setGroupInfoOpen(false), []);

  const actions = useMemo<ChatRoomActions>(
    () => ({
      startAudioCall,
      startVideoCall,
      endCall,
      openGroupInfo,
      closeGroupInfo,
    }),
    [startAudioCall, startVideoCall, endCall, openGroupInfo, closeGroupInfo],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length, visibleCalls.length]);

  useEffect(() => {
    const prev = prevConversationRef.current;
    prevConversationRef.current = activeConversationId;
    if (prev === activeConversationId) return;
    if (groupCall.inGroupCall) groupCall.leaveGroupCall();
    if (dmCall.inCall) dmCall.endCall();
    setGroupInfoOpen(false);
  }, [activeConversationId, dmCall, groupCall]);

  const value = useMemo<ChatRoomContextValue>(
    () => ({
      username,
      socket,
      room,
      activeConversationId,
      isDm,
      isGroup,
      inCall,
      groupLabel,
      activeGroup,
      showGroupInfo,
      groupInfoOpen,
      visibleMessages,
      visibleCalls,
      remoteParticipants,
      dmCall,
      groupCall,
      actions,
      bottomRef,
    }),
    [
      username,
      socket,
      room,
      activeConversationId,
      isDm,
      isGroup,
      inCall,
      groupLabel,
      activeGroup,
      showGroupInfo,
      groupInfoOpen,
      visibleMessages,
      visibleCalls,
      remoteParticipants,
      dmCall,
      groupCall,
      actions,
    ],
  );

  return <ChatRoomContext.Provider value={value}>{children}</ChatRoomContext.Provider>;
};
