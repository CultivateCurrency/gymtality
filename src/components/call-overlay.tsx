"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  PhoneOff,
  VideoIcon,
  VideoOff,
  Mic,
  MicOff,
  X,
} from "lucide-react";

interface CallOverlayProps {
  type: "audio" | "video";
  state: "calling" | "incoming" | "active";
  callerName: string;
  duration: number;
  isMuted: boolean;
  isVideoOff: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onToggleMute: () => void;
  onToggleVideo: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function CallOverlay({
  type,
  state,
  callerName,
  duration,
  isMuted,
  isVideoOff,
  localStream,
  remoteStream,
  onAccept,
  onReject,
  onEnd,
  onToggleMute,
  onToggleVideo,
}: CallOverlayProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950/95 flex flex-col items-center justify-center">
      {/* Video streams (only for video calls in active state) */}
      {type === "video" && state === "active" ? (
        <div className="relative w-full h-full">
          {/* Remote video (full screen) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />

          {/* Local video (picture-in-picture) */}
          <div className="absolute top-4 right-4 w-40 h-28 rounded-xl overflow-hidden border-2 border-zinc-700 bg-zinc-900">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover mirror"
              style={{ transform: "scaleX(-1)" }}
            />
            {isVideoOff && (
              <div className="absolute inset-0 bg-zinc-900 flex items-center justify-center">
                <VideoOff className="h-6 w-6 text-zinc-500" />
              </div>
            )}
          </div>

          {/* Call info overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-zinc-700 text-zinc-300">
                {callerName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-white text-sm drop-shadow">{callerName}</p>
              <p className="text-xs text-zinc-300 drop-shadow">{formatDuration(duration)}</p>
            </div>
          </div>
        </div>
      ) : (
        /* Audio call or ringing state */
        <div className="text-center space-y-6">
          <Avatar className="h-24 w-24 mx-auto">
            <AvatarFallback className="bg-zinc-800 text-zinc-300 text-3xl">
              {callerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xl font-bold text-white">{callerName}</p>
            <p className="text-sm text-zinc-400 mt-1">
              {state === "calling" && (type === "video" ? "Video calling..." : "Calling...")}
              {state === "incoming" && (type === "video" ? "Incoming video call..." : "Incoming call...")}
              {state === "active" && formatDuration(duration)}
            </p>
          </div>

          {/* Audio visualization placeholder for active audio calls */}
          {state === "active" && type === "audio" && (
            <div className="flex items-center justify-center gap-1 h-16">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-orange-500 rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 30}px`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: "0.8s",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Call Controls */}
      <div className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-4">
        {/* Incoming call - Accept/Reject */}
        {state === "incoming" && (
          <>
            <Button
              onClick={onReject}
              className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
            <Button
              onClick={onAccept}
              className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="h-6 w-6" />
            </Button>
          </>
        )}

        {/* Calling or Active - Controls */}
        {(state === "calling" || state === "active") && (
          <>
            <Button
              onClick={onToggleMute}
              variant="ghost"
              className={`h-12 w-12 rounded-full ${
                isMuted
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {type === "video" && (
              <Button
                onClick={onToggleVideo}
                variant="ghost"
                className={`h-12 w-12 rounded-full ${
                  isVideoOff
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                    : "bg-zinc-800 text-white hover:bg-zinc-700"
                }`}
              >
                {isVideoOff ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
              </Button>
            )}

            <Button
              onClick={onEnd}
              className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700 text-white"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
