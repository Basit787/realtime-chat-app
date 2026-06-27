import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { fetchIceServers, type CallType } from "@/pages/chat/api/api";

type CallPeer = {
  username: string;
  callType: CallType;
};

type UseWebRTCOptions = {
  socket: Socket | null;
  selfUsername: string;
  enabled: boolean;
};

const attachRemoteTrack = (
  event: RTCTrackEvent,
  remoteStreamRef: { current: MediaStream | null },
  setRemoteStream: (stream: MediaStream | null) => void,
) => {
  let stream = remoteStreamRef.current;
  if (!stream) {
    stream = new MediaStream();
    remoteStreamRef.current = stream;
  }

  const track = event.track;
  if (track && !stream.getTracks().some((t) => t.id === track.id)) {
    stream.addTrack(track);
  }

  setRemoteStream(new MediaStream(stream.getTracks()));
};

export const useWebRTC = ({ socket, selfUsername, enabled }: UseWebRTCOptions) => {
  const [callPeer, setCallPeer] = useState<CallPeer | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallPeer | null>(null);
  const [inCall, setInCall] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const iceServersRef = useRef<RTCIceServer[]>([]);
  const iceReadyRef = useRef<Promise<void> | null>(null);
  const pendingOfferRef = useRef<{ from: string; sdp: RTCSessionDescriptionInit } | null>(null);

  const ensureIceServers = useCallback(async () => {
    if (iceServersRef.current.length > 0) return;
    if (!iceReadyRef.current) {
      iceReadyRef.current = fetchIceServers()
        .then((config) => {
          iceServersRef.current = config.iceServers;
        })
        .catch((error) => {
          console.error(error);
          iceReadyRef.current = null;
        });
    }
    await iceReadyRef.current;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    void ensureIceServers();
  }, [enabled, ensureIceServers]);

  const cleanupCall = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setInCall(false);
    setCallPeer(null);
    setIncomingCall(null);
    pendingOfferRef.current = null;
  }, []);

  const createPeerConnection = useCallback(
    (peer: string) => {
      const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit("call:ice-candidate", { to: peer, candidate: event.candidate });
        }
      };
      pc.ontrack = (event) => {
        attachRemoteTrack(event, remoteStreamRef, setRemoteStream);
      };
      pcRef.current = pc;
      return pc;
    },
    [socket],
  );

  const attachLocalMedia = useCallback(async (callType: CallType) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === "video",
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    stream.getTracks().forEach((track) => pcRef.current?.addTrack(track, stream));
    return stream;
  }, []);

  const startCall = useCallback(
    async (peer: string, callType: CallType) => {
      if (!socket || peer === selfUsername || inCall) return;
      try {
        await ensureIceServers();
        setCallPeer({ username: peer, callType });
        const pc = createPeerConnection(peer);
        await attachLocalMedia(callType);
        socket.emit("call:invite", { to: peer, callType });
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("call:offer", { to: peer, sdp: offer });
        setInCall(true);
      } catch (error) {
        console.error(error);
        cleanupCall();
      }
    },
    [attachLocalMedia, cleanupCall, createPeerConnection, ensureIceServers, inCall, selfUsername, socket],
  );

  const acceptCall = useCallback(async () => {
    if (!socket || !incomingCall) return;
    const offer = pendingOfferRef.current;
    if (!offer || offer.from !== incomingCall.username) return;

    try {
      await ensureIceServers();
      const peer = incomingCall.username;
      setCallPeer(incomingCall);
      setIncomingCall(null);
      pendingOfferRef.current = null;

      const pc = createPeerConnection(peer);
      await attachLocalMedia(incomingCall.callType);
      await pc.setRemoteDescription(new RTCSessionDescription(offer.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call:answer", { to: peer, sdp: answer });
      setInCall(true);
    } catch (error) {
      console.error(error);
      cleanupCall();
    }
  }, [attachLocalMedia, cleanupCall, createPeerConnection, ensureIceServers, incomingCall, socket]);

  const rejectCall = useCallback(() => {
    if (socket && incomingCall) {
      socket.emit("call:reject", { to: incomingCall.username });
    }
    setIncomingCall(null);
    pendingOfferRef.current = null;
  }, [incomingCall, socket]);

  const endCall = useCallback(() => {
    if (socket && callPeer) {
      socket.emit("call:end", { to: callPeer.username });
    }
    cleanupCall();
  }, [callPeer, cleanupCall, socket]);

  useEffect(() => {
    if (!socket) return;

    const onIncoming = ({ from, callType }: { from: string; callType: CallType }) => {
      if (inCall) {
        socket.emit("call:reject", { to: from });
        return;
      }
      setIncomingCall({ username: from, callType });
    };

    const onOffer = ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      pendingOfferRef.current = { from, sdp };
    };

    const onAnswer = async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
      await pcRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
    };

    const onIce = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      if (candidate) await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    };

    const onEnd = () => cleanupCall();
    const onReject = () => cleanupCall();

    socket.on("call:incoming", onIncoming);
    socket.on("call:offer", onOffer);
    socket.on("call:answer", onAnswer);
    socket.on("call:ice-candidate", onIce);
    socket.on("call:end", onEnd);
    socket.on("call:reject", onReject);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:offer", onOffer);
      socket.off("call:answer", onAnswer);
      socket.off("call:ice-candidate", onIce);
      socket.off("call:end", onEnd);
      socket.off("call:reject", onReject);
    };
  }, [cleanupCall, inCall, socket]);

  return {
    callPeer,
    incomingCall,
    inCall,
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
  };
};
