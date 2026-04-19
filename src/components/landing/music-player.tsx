"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipBack, SkipForward, Music, Volume2, ChevronLeft, ChevronRight } from "lucide-react";

interface Song {
  songName: string;
  artistName: string;
  audioUrl: string;
  type: "theme" | "paid";
}

interface MusicPlayerProps {
  date: string;
}

export function LandingMusicPlayer({ date: initialDate }: MusicPlayerProps) {
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch rotation queue for selected date
  useEffect(() => {
    const fetchQueue = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/api/landing/rotation?date=${selectedDate}`);
        const data = await res.json();
        if (data.success && data.data?.queue) {
          setQueue(data.data.queue);
          setCurrentIndex(0);
          setCurrentTime(0);
        }
      } catch (err) {
        console.error("Failed to fetch music queue:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQueue();
    setIsPlaying(false);
  }, [selectedDate]);

  // Date navigation helpers
  const getPreviousDate = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    return date.toISOString().split("T")[0];
  };

  const getNextDate = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });
  };

  // Update audio src when current song changes
  useEffect(() => {
    if (audioRef.current && queue[currentIndex]) {
      audioRef.current.src = queue[currentIndex].audioUrl;
      if (isPlaying) {
        audioRef.current.play();
      }
    }
  }, [currentIndex, queue]);

  // Handle auto-play next song
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (currentIndex < queue.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [currentIndex, queue.length]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const currentSong = queue[currentIndex];

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const togglePlayPause = () => {
    if (queue.length === 0) return;
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentTime(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentTime(0);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 text-center">
        <p className="text-zinc-400">Loading music queue...</p>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-8 text-center">
        <p className="text-zinc-500">No music available for this date</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <audio ref={audioRef} crossOrigin="anonymous" />

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedDate(getPreviousDate())}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
          title="Previous day"
        >
          <ChevronLeft size={20} className="text-orange-400" />
        </button>

        <h2 className="text-lg font-semibold text-white">
          {formatDateDisplay(selectedDate)}
        </h2>

        <button
          onClick={() => setSelectedDate(getNextDate())}
          className="p-2 rounded-full hover:bg-zinc-800 transition-colors"
          title="Next day"
        >
          <ChevronRight size={20} className="text-orange-400" />
        </button>
      </div>

      {/* Player Card */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4">
        {/* Current Song Info */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Music
              size={16}
              className={currentSong?.type === "theme" ? "text-yellow-500" : "text-orange-400"}
            />
            <span className="text-xs uppercase tracking-wider text-zinc-400">
              {currentSong?.type === "theme" ? "Theme Song" : "Paid Song"}
            </span>
          </div>
          <h3 className="text-xl font-bold text-white truncate">{currentSong?.songName}</h3>
          <p className="text-sm text-zinc-400">{currentSong?.artistName}</p>
          <p className="text-xs text-zinc-500 mt-2">
            {currentIndex + 1} of {queue.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-2 rounded-full hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Previous song"
          >
            <SkipBack size={20} className="text-white" />
          </button>

          <button
            onClick={togglePlayPause}
            className="p-3 rounded-full bg-orange-500 hover:bg-orange-400 transition-colors"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause size={24} className="text-white" />
            ) : (
              <Play size={24} className="text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === queue.length - 1}
            className="p-2 rounded-full hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Next song"
          >
            <SkipForward size={20} className="text-white" />
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 ml-auto">
            <Volume2 size={16} className="text-zinc-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer accent-orange-500"
              title="Volume"
            />
          </div>
        </div>

        {/* Queue Preview */}
        <div className="pt-4 border-t border-zinc-700">
          <p className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Queue</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {queue.map((song, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setCurrentTime(0);
                  setIsPlaying(true);
                }}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  idx === currentIndex
                    ? "bg-orange-500/20 border border-orange-500/50"
                    : "hover:bg-zinc-700 border border-transparent"
                }`}
              >
                <p className="text-sm font-medium text-white truncate">{song.songName}</p>
                <p className="text-xs text-zinc-400 truncate">{song.artistName}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
