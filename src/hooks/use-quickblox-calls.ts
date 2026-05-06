"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { loadQuickBloxSDK, isChatConnected, setChatConnected } from "@/lib/quickblox-client";

type CallType = "audio" | "video";
type CallState = "idle" | "calling" | "incoming" | "active";

interface CallInfo {
  type: CallType;
  state: CallState;
  callerName: string;
  callerId: number;
  startTime: number | null;
}

// QuickBlox WebRTC session type (from SDK)
interface QBSession {
  getUserMedia: (params: any, cb: (err: any, stream: MediaStream) => void) => void;
  accept: (ext: any) => void;
  reject: (ext: any) => void;
  stop: (ext: any) => void;
  attachMediaStream: (el: string, stream: MediaStream, opts?: any) => void;
  detachMediaStream: (el: string) => void;
  peerConnections: Record<number, any>;
  initiatorID: number;
  opponentsIDs: number[];
  callType: number;
  currentUserID: number;
  ID: string;
}

let QB: any = null;
let qbInitialized = false;

export function useQuickBloxCalls(qbToken: string | null, qbUserId: number | null) {
  const [callInfo, setCallInfo] = useState<CallInfo>({
    type: "audio",
    state: "idle",
    callerName: "",
    callerId: 0,
    startTime: null,
  });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [duration, setDuration] = useState(0);
  const sessionRef = useRef<QBSession | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize QB SDK for WebRTC
  const initQB = useCallback(async () => {
    if (qbInitialized || !qbToken || !qbUserId) return;

    try {
      QB = await loadQuickBloxSDK();

      const appId = process.env.NEXT_PUBLIC_QUICKBLOX_APP_ID;
      const accountKey = process.env.NEXT_PUBLIC_QUICKBLOX_ACCOUNT_KEY;

      if (!appId || !accountKey) return;

      QB.init(appId, null, null, {
        debug: { mode: 0 },
        webrtc: { answerTimeInterval: 30, disconnectTimeInterval: 10 },
      });

      // If chat is already connected (from useQuickBlox hook), skip QB.chat.connect()
      // Just register WebRTC listeners on the existing connection
      if (isChatConnected() && QB.chat.isConnected) {
        qbInitialized = true;
        setupWebRTCListeners();
        return;
      }

      // Otherwise, connect to chat for WebRTC signaling
      const userCredentials = {
        userId: qbUserId,
        password: `qb_${qbUserId}_gymtality`,
      };

      QB.chat.connect(userCredentials, (connectErr: any) => {
        if (connectErr) {
          console.error("QB chat connect error:", connectErr);
          return;
        }

        setChatConnected(true);
        qbInitialized = true;
        setupWebRTCListeners();
      });
    } catch (err) {
      console.error("Failed to init QB WebRTC:", err);
    }
  }, [qbToken, qbUserId]);

  // Set up WebRTC event listeners
  const setupWebRTCListeners = useCallback(() => {
    if (!QB) return;

    QB.webrtc.onCallListener = (session: QBSession, extension: any) => {
      sessionRef.current = session;
      setCallInfo({
        type: session.callType === QB.webrtc.CallType.VIDEO ? "video" : "audio",
        state: "incoming",
        callerName: extension.callerName || `User ${session.initiatorID}`,
        callerId: session.initiatorID,
        startTime: null,
      });
    };

    QB.webrtc.onAcceptCallListener = (session: QBSession, userId: number, extension: any) => {
      setCallInfo((prev) => ({ ...prev, state: "active", startTime: Date.now() }));
    };

    QB.webrtc.onRejectCallListener = (session: QBSession, userId: number, extension: any) => {
      cleanupCall();
    };

    QB.webrtc.onStopCallListener = (session: QBSession, userId: number, extension: any) => {
      cleanupCall();
    };

    QB.webrtc.onRemoteStreamListener = (session: QBSession, userId: number, stream: MediaStream) => {
      setRemoteStream(stream);
    };

    QB.webrtc.onSessionConnectionStateChangedListener = (
      session: QBSession,
      userId: number,
      state: any
    ) => {
      // Handle disconnection
      if (state === QB.webrtc.SessionConnectionState.CLOSED ||
          state === QB.webrtc.SessionConnectionState.FAILED) {
        cleanupCall();
      }
    };
  }, []);

  // Start a call
  const startCall = useCallback(
    (opponentId: number, type: CallType, callerName: string) => {
      if (!QB || !qbInitialized) {
        console.error("QB not initialized for calls");
        return;
      }

      const callType = type === "video" ? QB.webrtc.CallType.VIDEO : QB.webrtc.CallType.AUDIO;
      const session = QB.webrtc.createNewSession([opponentId], callType);
      sessionRef.current = session;

      const mediaParams: any = {
        audio: true,
        video: type === "video" ? { width: 640, height: 480 } : false,
      };

      session.getUserMedia(mediaParams, (err: any, stream: MediaStream) => {
        if (err) {
          console.error("getUserMedia error:", err);
          cleanupCall();
          return;
        }

        setLocalStream(stream);
        session.call({ callerName });

        setCallInfo({
          type,
          state: "calling",
          callerName,
          callerId: qbUserId || 0,
          startTime: null,
        });
      });
    },
    [qbUserId]
  );

  // Accept incoming call
  const acceptCall = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;

    const mediaParams: any = {
      audio: true,
      video: callInfo.type === "video" ? { width: 640, height: 480 } : false,
    };

    session.getUserMedia(mediaParams, (err: any, stream: MediaStream) => {
      if (err) {
        console.error("getUserMedia error:", err);
        cleanupCall();
        return;
      }

      setLocalStream(stream);
      session.accept({});

      setCallInfo((prev) => ({
        ...prev,
        state: "active",
        startTime: Date.now(),
      }));
    });
  }, [callInfo.type]);

  // Reject incoming call
  const rejectCall = useCallback(() => {
    const session = sessionRef.current;
    if (session) {
      session.reject({});
    }
    cleanupCall();
  }, []);

  // End active call
  const endCall = useCallback(() => {
    const session = sessionRef.current;
    if (session) {
      session.stop({});
    }
    cleanupCall();
  }, []);

  // Toggle mute
  const [isMuted, setIsMuted] = useState(false);
  const toggleMute = useCallback(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, [localStream]);

  // Toggle video
  const [isVideoOff, setIsVideoOff] = useState(false);
  const toggleVideo = useCallback(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  }, [localStream]);

  // Cleanup call state
  function cleanupCall() {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    sessionRef.current = null;
    setCallInfo({
      type: "audio",
      state: "idle",
      callerName: "",
      callerId: 0,
      startTime: null,
    });
    setIsMuted(false);
    setIsVideoOff(false);
    setDuration(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // Duration timer
  useEffect(() => {
    if (callInfo.state === "active" && callInfo.startTime) {
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - callInfo.startTime!) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callInfo.state, callInfo.startTime]);

  // Init on mount when token/userId available
  useEffect(() => {
    initQB();
  }, [initQB]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.stop({});
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    callInfo,
    localStream,
    remoteStream,
    duration,
    isMuted,
    isVideoOff,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
}
