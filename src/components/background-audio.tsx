"use client";

import { useEffect, useRef } from "react";

export function BackgroundAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    // Try to play audio on mount
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
  }, []);

  return (
    <audio ref={audioRef} loop style={{ display: "none" }}>
      <source src="/audio/gymtality-theme-personal-trainer.mp3" type="audio/mpeg" />
    </audio>
  );
}
