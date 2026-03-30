"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Volume2,
  Plus,
  ListMusic,
  Search,
  Heart,
  Disc3,
  Loader2,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const CATEGORY_GRADIENTS: Record<string, string> = {
  HIIT: "from-orange-600 to-red-600",
  Yoga: "from-purple-600 to-blue-600",
  Strength: "from-green-600 to-emerald-600",
  Cardio: "from-pink-600 to-rose-600",
  Meditation: "from-cyan-600 to-teal-600",
  Warmup: "from-amber-600 to-yellow-600",
};

function gradientForCategory(category: string | null) {
  return CATEGORY_GRADIENTS[category || ""] || "from-zinc-600 to-zinc-700";
}

interface Album {
  id: string;
  name: string;
  category: string | null;
  coverImage: string | null;
  _count: { songs: number };
}

interface Song {
  id: string;
  title: string;
  artist: string | null;
  duration: number;
  audioUrl: string | null;
  order: number;
}

interface AlbumDetail extends Album {
  songs: Song[];
}

interface Playlist {
  id: string;
  name: string;
  _count: { songs: number };
}

export default function MusicPage() {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [musicSearch, setMusicSearch] = useState("");
  const { user } = useAuthStore();
  const userId = user?.id;

  const audioRef = useRef<HTMLAudioElement>(null);
  // Refs so audio event handlers always see fresh values (no stale closures)
  const shuffleRef = useRef(false);
  const repeatRef = useRef(false);
  const songsRef = useRef<Song[]>([]);
  const currentSongRef = useRef<Song | null>(null);

  shuffleRef.current = isShuffle;
  repeatRef.current = isRepeat;
  currentSongRef.current = currentSong;

  const { data: albums, loading: albumsLoading } = useApi<Album[]>("/api/music/albums");
  const { data: albumDetail, loading: songsLoading } = useApi<AlbumDetail>(
    selectedAlbum ? `/api/music/albums/${selectedAlbum}` : null
  );
  const { data: playlists, loading: playlistsLoading, refetch: refetchPlaylists } = useApi<Playlist[]>(
    userId ? `/api/music/playlists?userId=${userId}` : null
  );

  const songs = albumDetail?.songs ?? [];
  songsRef.current = songs;

  const playSong = useCallback((song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setShowPlayer(true);
    setCurrentTime(0);
  }, []);

  const skipToSong = useCallback((song: Song) => {
    playSong(song);
  }, [playSong]);

  const handleSkipForward = useCallback(() => {
    const list = songsRef.current;
    const cur = currentSongRef.current;
    if (!list.length) return;

    if (shuffleRef.current) {
      const others = list.filter((s) => s.id !== cur?.id);
      const next = others.length > 0 ? others[Math.floor(Math.random() * others.length)] : list[0];
      skipToSong(next);
      return;
    }

    const idx = list.findIndex((s) => s.id === cur?.id);
    if (idx === -1 || idx === list.length - 1) {
      if (repeatRef.current) skipToSong(list[0]);
      // else stop — we're at the end
    } else {
      skipToSong(list[idx + 1]);
    }
  }, [skipToSong]);

  const handleSkipBack = useCallback(() => {
    const list = songsRef.current;
    const cur = currentSongRef.current;
    if (!list.length) return;

    // If more than 3s in, restart current song
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    const idx = list.findIndex((s) => s.id === cur?.id);
    if (idx <= 0) {
      skipToSong(list[0]);
    } else {
      skipToSong(list[idx - 1]);
    }
  }, [skipToSong]);

  // Wire up audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setAudioDuration(audio.duration || 0);
    const handleEnded = () => {
      if (repeatRef.current && songsRef.current.length === 1) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        handleSkipForward();
      }
    };
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, [handleSkipForward]);

  // Load new song into audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (currentSong.audioUrl) {
      audio.src = currentSong.audioUrl;
      audio.volume = volume / 100;
      audio.play().catch(() => {});
    } else {
      // No audio URL — simulate play state only (preview mode)
      audio.src = "";
      setIsPlaying(true);
    }
  }, [currentSong?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync play/pause button to audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.audioUrl) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const handleToggleLike = async (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    const wasLiked = likedSongs.has(song.id);
    // Optimistic update
    setLikedSongs((prev) => {
      const next = new Set(prev);
      if (wasLiked) next.delete(song.id);
      else next.add(song.id);
      return next;
    });
    try {
      await apiFetch(`/api/music/songs/${song.id}/like`, {
        method: wasLiked ? "DELETE" : "POST",
      });
    } catch {
      // Revert on failure
      setLikedSongs((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.add(song.id);
        else next.delete(song.id);
        return next;
      });
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audioDuration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audioDuration;
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || !userId) return;
    try {
      await apiFetch("/api/music/playlists", {
        method: "POST",
        body: JSON.stringify({ userId, name: newPlaylistName }),
      });
      setNewPlaylistName("");
      setDialogOpen(false);
      refetchPlaylists();
    } catch {}
  };

  const progressRatio = audioDuration > 0 ? currentTime / audioDuration : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-32">
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Music</h1>
          <p className="text-zinc-400 mt-1">Albums, playlists, and workout tracks</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Playlist
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-white">Create Playlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={handleCreatePlaylist}
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Search songs, albums, artists..."
          value={musicSearch}
          onChange={(e) => setMusicSearch(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500"
        />
      </div>

      {/* My Playlists */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ListMusic className="h-5 w-5 text-orange-500" />
          My Playlists
        </h2>
        {playlistsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
          </div>
        ) : (playlists && playlists.length > 0) ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {playlists.map((pl) => (
              <Card
                key={pl.id}
                className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition cursor-pointer"
              >
                <CardContent className="pt-4 text-center">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 mx-auto mb-3 flex items-center justify-center">
                    <ListMusic className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-white text-sm">{pl.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{pl._count.songs} songs</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No playlists yet. Create one above!</p>
        )}
      </div>

      {/* Albums */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Disc3 className="h-5 w-5 text-orange-500" />
          Albums
        </h2>
        {albumsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
          </div>
        ) : (albums && albums.length > 0) ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {albums
              .filter(
                (a) =>
                  !musicSearch ||
                  a.name.toLowerCase().includes(musicSearch.toLowerCase()) ||
                  (a.category || "").toLowerCase().includes(musicSearch.toLowerCase())
              )
              .map((album) => (
                <button
                  key={album.id}
                  onClick={() => setSelectedAlbum(selectedAlbum === album.id ? null : album.id)}
                  className="text-left group"
                >
                  <div
                    className={`aspect-square rounded-xl bg-gradient-to-br ${gradientForCategory(album.category)} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform ${
                      selectedAlbum === album.id ? "ring-2 ring-orange-500" : ""
                    }`}
                  >
                    {album.coverImage ? (
                      <img src={album.coverImage} alt={album.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Music className="h-10 w-10 text-white/80" />
                    )}
                  </div>
                  <h3 className="font-semibold text-white text-sm truncate">{album.name}</h3>
                  <p className="text-xs text-zinc-500">{album._count.songs} songs · {album.category || "General"}</p>
                </button>
              ))}
          </div>
        ) : (
          <p className="text-zinc-500 text-sm">No albums available yet.</p>
        )}
      </div>

      {/* Song List (when album selected) */}
      {selectedAlbum && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-4">
            <h3 className="font-bold text-white mb-4">
              {albumDetail?.name || "Loading..."}
            </h3>
            {songsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-1">
                {songs
                  .filter(
                    (s) =>
                      !musicSearch ||
                      s.title.toLowerCase().includes(musicSearch.toLowerCase()) ||
                      (s.artist || "").toLowerCase().includes(musicSearch.toLowerCase())
                  )
                  .map((song, i) => (
                    <button
                      key={song.id}
                      onClick={() => playSong(song)}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-zinc-800 transition ${
                        currentSong?.id === song.id ? "bg-orange-500/10" : ""
                      }`}
                    >
                      <span className="text-sm text-zinc-500 w-6">{i + 1}</span>
                      <div className="flex-1 text-left">
                        <p
                          className={`text-sm font-medium ${
                            currentSong?.id === song.id ? "text-orange-500" : "text-white"
                          }`}
                        >
                          {song.title}
                        </p>
                        <p className="text-xs text-zinc-500">{song.artist || "Unknown Artist"}</p>
                      </div>
                      <button
                        onClick={(e) => handleToggleLike(e, song)}
                        className={`p-1 transition ${
                          likedSongs.has(song.id) ? "text-red-400" : "text-zinc-500 hover:text-red-400"
                        }`}
                        aria-label={likedSongs.has(song.id) ? "Unlike song" : "Like song"}
                      >
                        <Heart className={`h-4 w-4 ${likedSongs.has(song.id) ? "fill-red-400" : ""}`} />
                      </button>
                      <span className="text-xs text-zinc-500">{formatDuration(song.duration)}</span>
                      <Play className="h-4 w-4 text-zinc-500" />
                    </button>
                  ))}
                {songs.length === 0 && (
                  <p className="text-zinc-500 text-sm text-center py-4">No songs in this album yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bottom Music Player */}
      {showPlayer && currentSong && (
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-zinc-950 border-t border-zinc-800 p-4 z-50">
          <div className="max-w-7xl mx-auto flex items-center gap-6">
            {/* Song Info */}
            <div className="flex items-center gap-3 w-64 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center flex-shrink-0">
                <Music className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentSong.title}</p>
                <p className="text-xs text-zinc-500 truncate">{currentSong.artist || "Unknown Artist"}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsShuffle((v) => !v)}
                  className={`transition ${isShuffle ? "text-orange-500" : "text-zinc-400 hover:text-white"}`}
                  aria-label="Toggle shuffle"
                >
                  <Shuffle className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSkipBack}
                  className="text-zinc-400 hover:text-white transition"
                  aria-label="Previous song"
                >
                  <SkipBack className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsPlaying((v) => !v)}
                  className="bg-orange-500 rounded-full p-2 hover:bg-orange-600 transition"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-white" />
                  ) : (
                    <Play className="h-5 w-5 text-white" />
                  )}
                </button>
                <button
                  onClick={handleSkipForward}
                  className="text-zinc-400 hover:text-white transition"
                  aria-label="Next song"
                >
                  <SkipForward className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setIsRepeat((v) => !v)}
                  className={`transition ${isRepeat ? "text-orange-500" : "text-zinc-400 hover:text-white"}`}
                  aria-label="Toggle repeat"
                >
                  <Repeat className="h-4 w-4" />
                </button>
              </div>
              {/* Progress Bar */}
              <div className="w-full max-w-md flex items-center gap-2">
                <span className="text-xs text-zinc-500">{formatDuration(currentTime)}</span>
                <div
                  className="flex-1 h-1 bg-zinc-800 rounded-full cursor-pointer relative"
                  onClick={handleSeek}
                  role="slider"
                  aria-label="Seek"
                >
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${progressRatio * 100}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-500">
                  {audioDuration > 0 ? formatDuration(audioDuration) : formatDuration(currentSong.duration)}
                </span>
              </div>
            </div>

            {/* Volume */}
            <div className="hidden sm:flex items-center gap-2 w-40">
              <Volume2 className="h-4 w-4 text-zinc-400 flex-shrink-0" />
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full accent-orange-500"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
