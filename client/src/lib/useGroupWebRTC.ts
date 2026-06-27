import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { fetchIceServers, type CallType } from "@/pages/chat/api/api";

export type GroupCallState = {
  room: string;
  callType: CallType;
  host: string;
  participants: string[];
};

type UseGroupWebRTCOptions = {
  socket: Socket | null;
  selfUsername: string;
  room: string;
  enabled: boolean;
};

export const useGroupWebRTC = ({ socket, selfUsername, room, enabled }: UseGroupWebRTCOptions) => {
  const [inGroupCall, setInGroupCall] = useState(false);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [callType, setCallType] = useState<CallType>("audio");
  const [participants, setParticipants] = useState<string[]>([]);
  const [roomCall, setRoomCall] = useState<GroupCallState | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  const iceServersRef = useRef<RTCIceServer[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const activeRoomRef = useRef<string | null>(null);
  const inGroupCallRef = useRef(false);
  const participantsRef = useRef<string[]>([]);
  const dismissedRoomRef = useRef<string | null>(null);

  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  useEffect(() => {
    inGroupCallRef.current = inGroupCall;
  }, [inGroupCall]);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    if (!enabled) return;
    fetchIceServers()
      .then((config) => {
        iceServersRef.current = config.iceServers;
      })
      .catch(console.error);
  }, [enabled]);

  const cleanupPeer = useCallback((peer: string) => {
    pcsRef.current.get(peer)?.close();
    pcsRef.current.delete(peer);
    setRemoteStreams((prev) => {
      const next = new Map(prev);
      next.delete(peer);
      return next;
    });
  }, []);

  const cleanupAll = useCallback(() => {
    for (const peer of [...pcsRef.current.keys()]) cleanupPeer(peer);
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStreams(new Map());
    setInGroupCall(false);
    setActiveRoom(null);
    setParticipants([]);
  }, [cleanupPeer]);

  const attachLocalMedia = useCallback(async (type: CallType) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    for (const pc of pcsRef.current.values()) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }
    return stream;
  }, []);

  const createPeerConnection = useCallback(
    (peer: string, callRoom: string) => {
      let pc = pcsRef.current.get(peer);
      if (pc) return pc;

      pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("group-call:ice-candidate", {
            room: callRoom,
            to: peer,
            candidate: event.candidate,
          });
        }
      };
      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) {
          setRemoteStreams((prev) => new Map(prev).set(peer, stream));
        }
      };

      localStreamRef.current?.getTracks().forEach((track) => {
        if (localStreamRef.current) pc!.addTrack(track, localStreamRef.current);
      });

      pcsRef.current.set(peer, pc);
      return pc;
    },
    [socket],
  );

  const connectToPeers = useCallback(
    async (callRoom: string, peers: string[]) => {
      if (!socket) return;
      for (const peer of peers) {
        if (peer === selfUsername || pcsRef.current.has(peer)) continue;
        const pc = createPeerConnection(peer, callRoom);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("group-call:offer", { room: callRoom, to: peer, sdp: offer });
      }
    },
    [createPeerConnection, selfUsername, socket],
  );

  const enterCall = useCallback(
    async (state: GroupCallState) => {
      setRoomCall(null);
      dismissedRoomRef.current = null;
      setActiveRoom(state.room);
      setCallType(state.callType);
      setParticipants(state.participants);
      setInGroupCall(true);

      if (!localStreamRef.current) {
        await attachLocalMedia(state.callType);
      }

      const existing = new Set(participantsRef.current);
      const peersToConnect = state.participants.filter((p) => p !== selfUsername && !existing.has(p));
      await connectToPeers(state.room, peersToConnect);
    },
    [attachLocalMedia, connectToPeers, selfUsername],
  );

  const startGroupCall = useCallback(
    async (callRoom: string, type: CallType) => {
      if (!socket || inGroupCallRef.current) return;
      try {
        dismissedRoomRef.current = null;
        setCallType(type);
        setActiveRoom(callRoom);
        setInGroupCall(true);
        setParticipants([selfUsername]);
        setRoomCall(null);
        await attachLocalMedia(type);
        socket.emit("group-call:start", { room: callRoom, callType: type });
      } catch (error) {
        console.error(error);
        cleanupAll();
      }
    },
    [attachLocalMedia, cleanupAll, selfUsername, socket],
  );

  const joinGroupCall = useCallback(
    (callRoom: string) => {
      if (!socket || inGroupCallRef.current) return;
      dismissedRoomRef.current = null;
      socket.emit("group-call:join", { room: callRoom });
    },
    [socket],
  );

  const leaveGroupCall = useCallback(() => {
    if (socket && activeRoomRef.current) {
      socket.emit("group-call:leave", { room: activeRoomRef.current });
    }
    cleanupAll();
  }, [cleanupAll, socket]);

  const dismissIncoming = useCallback(() => {
    if (roomCall) dismissedRoomRef.current = roomCall.room;
    setRoomCall(null);
  }, [roomCall]);

  useEffect(() => {
    if (!socket) return;

    const onState = (state: GroupCallState) => {
      if (state.room === room) {
        if (!inGroupCallRef.current && !state.participants.includes(selfUsername)) {
          if (dismissedRoomRef.current !== state.room) setRoomCall(state);
        } else if (!inGroupCallRef.current && state.participants.includes(selfUsername)) {
          void enterCall(state);
        }
      }

      if (state.room !== activeRoomRef.current || !inGroupCallRef.current) return;

      const previous = participantsRef.current;
      setParticipants(state.participants);
      setCallType(state.callType);

      const newPeers = state.participants.filter((p) => p !== selfUsername && !previous.includes(p));
      if (newPeers.length > 0) void connectToPeers(state.room, newPeers);

      for (const peer of previous) {
        if (!state.participants.includes(peer)) cleanupPeer(peer);
      }
    };

    const onEnded = ({ room: endedRoom }: { room: string }) => {
      if (endedRoom === room) {
        setRoomCall(null);
        dismissedRoomRef.current = null;
      }
      if (endedRoom === activeRoomRef.current) cleanupAll();
    };

    const onOffer = async ({
      from,
      room: offerRoom,
      sdp,
    }: {
      from: string;
      room: string;
      sdp: RTCSessionDescriptionInit;
    }) => {
      if (!inGroupCallRef.current || offerRoom !== activeRoomRef.current) return;
      const pc = createPeerConnection(from, offerRoom);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("group-call:answer", { room: offerRoom, to: from, sdp: answer });
    };

    const onAnswer = async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      const pc = pcsRef.current.get(from);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    const onIce = async ({ from, candidate }: { from: string; candidate: RTCIceCandidateInit }) => {
      const pc = pcsRef.current.get(from);
      if (!pc || !candidate) return;
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    };

    socket.on("group-call:state", onState);
    socket.on("group-call:ended", onEnded);
    socket.on("group-call:offer", onOffer);
    socket.on("group-call:answer", onAnswer);
    socket.on("group-call:ice-candidate", onIce);

    return () => {
      socket.off("group-call:state", onState);
      socket.off("group-call:ended", onEnded);
      socket.off("group-call:offer", onOffer);
      socket.off("group-call:answer", onAnswer);
      socket.off("group-call:ice-candidate", onIce);
    };
  }, [cleanupAll, cleanupPeer, connectToPeers, createPeerConnection, enterCall, room, selfUsername, socket]);

  useEffect(() => {
    dismissedRoomRef.current = null;
    setRoomCall(null);
  }, [room]);

  return {
    inGroupCall,
    callType,
    participants,
    roomCall,
    localStream,
    remoteStreams,
    startGroupCall,
    joinGroupCall,
    leaveGroupCall,
    dismissIncoming,
  };
};
