"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useApi } from "@/hooks/use-api";

interface RotationTrack {
  type: "theme" | "paid";
  songName: string;
  artistName: string;
  audioUrl?: string; // for uploads
  spotifyTrackUri?: string; // for Spotify
  spotifyPreviewUrl?: string; // Spotify preview
  spotifyCoverImage?: string; // album art
  source?: "spotify" | "upload"; // data source
}

interface RotationResponse {
  queue: RotationTrack[];
}

export function AudioRotationPlayer() {
  const { data: rotationData } = useApi<RotationResponse>("/api/landing/rotation");
  const [queue, setQueue] = useState<RotationTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize queue from API
  useEffect(() => {
    if (rotationData?.queue && rotationData.queue.length > 0) {
      setQueue(rotationData.queue);
      console.log("Audio queue loaded:", rotationData.queue);
    } else {
      console.log("No queue data yet:", rotationData);
    }
  }, [rotationData]);

  // Auto-play and cycle every 30 seconds
  useEffect(() => {
    if (queue.length === 0) return;

    const playTrack = async () => {
      const track = queue[currentIndex];
      if (!audioRef.current) return;

      // Determine audio URL based on source
      let audioUrl: string | null = null;

      if (track.source === "spotify" && track.spotifyPreviewUrl) {
        // Spotify preview (30s, works without premium)
        audioUrl = track.spotifyPreviewUrl;
      } else if (track.source === "upload" && track.audioUrl) {
        // Uploaded audio file
        audioUrl = track.audioUrl;
      } else if (track.audioUrl) {
        // Fallback for theme song or legacy tracks
        audioUrl = track.audioUrl;
      }

      if (!audioUrl) {
        console.warn("No audio URL for track:", track.songName);
        return;
      }

      audioRef.current.src = audioUrl;
      audioRef.current.volume = 0.5;

      // Start muted to bypass autoplay restrictions, then unmute
      audioRef.current.muted = true;
      try {
        console.log("Attempting to play:", audioUrl);
        await audioRef.current.play();
        audioRef.current.muted = isMuted; // Apply actual mute state after playing starts
        setIsPlaying(true);
        console.log("Audio playing successfully");
      } catch (err) {
        console.error("Failed to play audio:", err, { audioUrl, muted: isMuted });
      }
    };

    playTrack();

    // Advance to next track after 30 seconds
    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % queue.length);
      setProgress(0);
    }, 30000);

    return () => clearTimeout(timer);
  }, [currentIndex, queue, isMuted]);

  // Progress bar animation
  useEffect(() => {
    if (!isPlaying || queue.length === 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 30) return 0;
        return prev + 0.1;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, queue.length]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (queue.length === 0) return null;

  const currentTrack = queue[currentIndex];
  const nextTracks = queue
    .slice(currentIndex + 1, currentIndex + 4)
    .map((t) => t.songName)
    .join(" · ");

  return (
    <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-lg p-4 shadow-lg">
      <audio ref={audioRef} autoPlay muted onError={(e) => console.error("Audio error:", e)} />

      <div className="flex items-center justify-between gap-4">
        {/* Album Art */}
        {currentTrack.spotifyCoverImage && (
          <div className="flex-shrink-0">
            <img
              src={currentTrack.spotifyCoverImage}
              alt={currentTrack.songName}
              className="w-12 h-12 rounded-lg object-cover"
            />
          </div>
        )}

        {/* Now Playing Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-orange-400">🎵</span>
            <span className="text-xs text-zinc-400 truncate">Now Playing:</span>
          </div>
          <p className="text-sm font-semibold text-white truncate">
            {currentTrack.songName}
          </p>
          <p className="text-xs text-zinc-400 truncate">
            {currentTrack.artistName}
          </p>
        </div>

        {/* Mute Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 hover:bg-zinc-700 rounded-lg transition-colors flex-shrink-0"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5 text-zinc-400" />
          ) : (
            <Volume2 className="h-5 w-5 text-orange-500" />
          )}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 space-y-1">
        <div className="w-full h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all"
            style={{ width: `${(progress / 30) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-zinc-500">
          <span>{Math.floor(progress)}s</span>
          <span>30s</span>
        </div>
      </div>

      {/* Up Next */}
      {nextTracks && (
        <p className="text-xs text-zinc-500 mt-2 truncate">
          Up next: {nextTracks}
        </p>
      )}
    </div>
  );
}
