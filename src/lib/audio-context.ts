/**
 * Global audio state manager for coordinating background music and user playlists
 * Prevents overlapping audio playback and persists pause state across navigation
 */

type AudioEventCallback = (paused: boolean) => void;

class AudioStateManager {
  private listeners: Set<AudioEventCallback> = new Set();
  private _isPaused = false;

  constructor() {
    // Restore pause state from localStorage on init
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("gymtality-bg-audio-paused");
      this._isPaused = stored === "true";
    }
  }

  get isPaused() {
    return this._isPaused;
  }

  setPaused(paused: boolean) {
    if (this._isPaused === paused) return;
    this._isPaused = paused;
    if (typeof window !== "undefined") {
      localStorage.setItem("gymtality-bg-audio-paused", paused.toString());
    }
    this.notifyListeners();
  }

  subscribe(callback: AudioEventCallback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb(this._isPaused));
  }

  /**
   * Called when user starts playing music from /member/music
   * Pauses background audio automatically
   */
  pauseBackgroundForUserPlayback() {
    this.setPaused(true);
  }

  /**
   * Called when user stops their music playback
   * Resumes background audio if it wasn't manually paused
   */
  resumeBackgroundAfterUserPlayback() {
    // Only resume if user didn't manually pause it
    const wasManuallyPaused = localStorage.getItem("gymtality-bg-audio-manually-paused") === "true";
    if (!wasManuallyPaused) {
      this.setPaused(false);
    }
  }

  /**
   * Mark that user manually paused via UI button (not auto-paused for music conflict)
   */
  markManualPause(manual: boolean) {
    localStorage.setItem("gymtality-bg-audio-manually-paused", manual.toString());
  }
}

// Singleton instance
export const audioStateManager = new AudioStateManager();
