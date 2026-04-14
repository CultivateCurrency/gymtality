"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, Pause, Play } from "lucide-react";
import { audioStateManager } from "@/lib/audio-context";

export function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [showWidget, setShowWidget] = useState(true);

  // Initialize pause state from localStorage
  useEffect(() => {
    setIsPaused(audioStateManager.isPaused);
  }, []);

  // Subscribe to global audio state changes
  useEffect(() => {
    const unsubscribe = audioStateManager.subscribe((paused) => {
      setIsPaused(paused);
      const audio = audioRef.current;
      if (!audio) return;
      if (paused) {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
    });

    return unsubscribe;
  }, []);

  // Try to play audio on mount (unless paused)
  useEffect(() => {
    if (!audioRef.current || isPaused) return;

    const playAudio = async () => {
      try {
        await audioRef.current!.play();
      } catch (err) {
        // Browser blocked autoplay — unmute on first user interaction
        const handleInteraction = async () => {
          try {
            await audioRef.current!.play();
            document.removeEventListener("click", handleInteraction);
            document.removeEventListener("touchstart", handleInteraction);
          } catch (e) {
            // Silent fail
          }
        };
        document.addEventListener("click", handleInteraction);
        document.addEventListener("touchstart", handleInteraction);
      }
    };

    playAudio();
  }, [isPaused]);

  const handleTogglePause = () => {
    const newPausedState = !isPaused;
    audioStateManager.markManualPause(newPausedState);
    audioStateManager.setPaused(newPausedState);
  };

  return (
    <>
      <audio ref={audioRef} loop style={{ display: "none" }}>
        <source src="/audio/gymtality-theme-personal-trainer.mp3" type="audio/mpeg" />
      </audio>

      {/* Floating Audio Control Widget */}
      {showWidget && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={handleTogglePause}
            title={isPaused ? "Resume background music" : "Pause background music"}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg transition-all hover:scale-105"
          >
            <Volume2 className="h-4 w-4" />
            {isPaused ? (
              <Play className="h-4 w-4" />
            ) : (
              <Pause className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </>
  );
}
