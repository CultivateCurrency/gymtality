"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUpload } from "@/hooks/use-upload";
import { useMutation } from "@/hooks/use-api";
import { useApi } from "@/hooks/use-api";
import { Music, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  preview_url: string | null;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  artists: Array<{ id: string; name: string }>;
  duration_ms: number;
  external_url: string;
}

interface BookingResponse {
  clientSecret: string;
  bookingId: string;
}

interface BookingStatusResponse {
  bookings: Array<{
    id: string;
    songName: string;
    artistName: string;
    bookingDate: string;
    status: string;
    createdAt: string;
    source: string;
  }>;
}

declare global {
  interface Window {
    Stripe: any;
  }
}

export default function LandingAudioBookingPage() {
  const router = useRouter();
  const { upload, uploading, progress, error: uploadError } = useUpload();
  const { data: bookingsData, loading: bookingsLoading } = useApi<BookingStatusResponse>("/api/landing/bookings/mine");
  const { mutate: createBooking, loading: bookingLoading } = useMutation<BookingResponse>("/api/landing/bookings", "POST");

  // Form state
  const [bookingMode, setBookingMode] = useState<"spotify" | "upload">("spotify");
  const [form, setForm] = useState({
    songName: "",
    artistName: "",
    bookingDate: "",
  });
  const [spotifyTrack, setSpotifyTrack] = useState<SpotifyTrack | null>(null);
  const [spotifyQuery, setSpotifyQuery] = useState("");
  const [spotifyResults, setSpotifyResults] = useState<SpotifyTrack[]>([]);
  const [searchingSpotify, setSearchingSpotify] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioKey, setAudioKey] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSpotifySearch = async () => {
    if (!spotifyQuery.trim()) return;
    setSearchingSpotify(true);
    setError("");

    try {
      const response = await fetch(
        `/api/landing/spotify/search?q=${encodeURIComponent(spotifyQuery)}&limit=10`
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to search Spotify");
        setSpotifyResults([]);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setSpotifyResults(data.data.tracks || []);
        if (data.data.tracks.length === 0) {
          toast.info("No tracks found for that search");
        }
      } else {
        setError(data.error || "Failed to search Spotify");
        setSpotifyResults([]);
      }
    } catch (err) {
      setError("Failed to search Spotify");
      console.error(err);
      setSpotifyResults([]);
    } finally {
      setSearchingSpotify(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setError("");

    try {
      const result = await upload(file, "landing-audio", "audio");
      if (result) {
        setAudioUrl(result.url);
        setAudioKey(result.key);
        toast.success("Audio uploaded successfully");
      }
    } catch (err) {
      setError("Failed to upload audio");
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!form.songName || !form.artistName || !form.bookingDate) {
      setError("Please fill in all fields");
      return;
    }

    if (bookingMode === "spotify" && !spotifyTrack) {
      setError("Please select a Spotify track");
      return;
    }

    if (bookingMode === "upload" && (!audioUrl || !audioKey)) {
      setError("Please upload an audio file");
      return;
    }

    if (!agreedToTerms) {
      setError("You must agree to the terms");
      return;
    }

    // Check booking date is in future
    const bookingDate = new Date(form.bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      setError("Booking date must be in the future");
      return;
    }

    setProcessing(true);

    try {
      // Prepare booking payload based on mode
      const bookingPayload: any = {
        songName: form.songName,
        artistName: form.artistName,
        bookingDate: bookingDate.toISOString(),
        agreedToTerms: true,
      };

      if (bookingMode === "spotify" && spotifyTrack) {
        bookingPayload.spotifyTrackUri = spotifyTrack.uri;
        bookingPayload.spotifyPreviewUrl = spotifyTrack.preview_url;
        bookingPayload.spotifyTrackName = spotifyTrack.name;
        bookingPayload.spotifyArtistName = spotifyTrack.artists?.[0]?.name || form.artistName;
        bookingPayload.spotifyCoverImage = spotifyTrack.album?.images?.[0]?.url;
      } else {
        bookingPayload.audioUrl = audioUrl;
        bookingPayload.audioKey = audioKey;
      }

      // Create booking and get Stripe payment intent
      const bookingResponse = await createBooking(bookingPayload);

      if (!bookingResponse) {
        setError("Failed to create booking");
        setProcessing(false);
        return;
      }

      // Use test card for demo (in production, use Stripe Elements for real cards)
      // For testing, use these test cards:
      // 4242 4242 4242 4242 (success)
      // 4000 0000 0000 0002 (decline)

      const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
      if (!stripeKey) {
        setError("Stripe configuration missing");
        setProcessing(false);
        return;
      }

      // In production, prompt user for card details and use Stripe Elements
      const testCard = prompt(
        "DEMO MODE: Enter test card (4242 4242 4242 4242) or press OK to use default",
        "4242"
      );

      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;
      script.onload = async () => {
        try {
          const stripe = window.Stripe(stripeKey);
          if (!stripe) {
            setError("Failed to initialize Stripe");
            setProcessing(false);
            return;
          }

          // For production, use Stripe Elements. For now, use test token
          const testToken = testCard === "4000 0000 0000 0002" ? "tok_chargeDeclined" : "tok_visa";

          const { paymentIntent, error: stripeError } = await stripe.confirmCardPayment(
            bookingResponse.clientSecret,
            {
              payment_method: {
                type: "card",
                card: {
                  token: testToken,
                },
              },
            }
          );

          if (stripeError) {
            setError(stripeError.message || "Payment failed");
          } else if (paymentIntent?.status === "succeeded") {
            toast.success("Booking created! Your song is pending review.");
            setForm({ songName: "", artistName: "", bookingDate: "" });
            setSpotifyTrack(null);
            setSpotifyQuery("");
            setAudioFile(null);
            setAudioUrl("");
            setAudioKey("");
            setAgreedToTerms(false);
            setBookingMode("spotify");
            router.refresh();
          } else {
            setError("Payment processing failed");
          }
        } catch (err: any) {
          setError(err.message || "Payment processing failed");
        } finally {
          setProcessing(false);
        }
      };
      script.onerror = () => {
        setError("Failed to load Stripe");
        setProcessing(false);
      };
      document.head.appendChild(script);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error(err);
      setProcessing(false);
    }
  };

  const recentBookings = bookingsLoading ? [] : (bookingsData?.bookings || []);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Book Landing Page Audio Slot</h1>
        <p className="text-zinc-400">Promote your music on Gymtality's landing page — $20 per day</p>
      </div>

      {/* Booking Form */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Create Booking</CardTitle>
          <CardDescription className="text-zinc-400">
            Your song will rotate every 30 seconds alongside Gymtality's theme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-zinc-800 rounded-lg">
              <button
                type="button"
                onClick={() => setBookingMode("spotify")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                  bookingMode === "spotify"
                    ? "bg-green-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Music className="h-4 w-4" />
                Spotify
              </button>
              <button
                type="button"
                onClick={() => setBookingMode("upload")}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
                  bookingMode === "upload"
                    ? "bg-orange-500 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Music className="h-4 w-4" />
                Upload
              </button>
            </div>

            {/* Song Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="songName" className="text-zinc-300">
                  Song Name
                </Label>
                <Input
                  id="songName"
                  placeholder="e.g., Morning Energy"
                  value={form.songName}
                  onChange={(e) => setForm({ ...form, songName: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="artistName" className="text-zinc-300">
                  Artist Name
                </Label>
                <Input
                  id="artistName"
                  placeholder="Your name or artist alias"
                  value={form.artistName}
                  onChange={(e) => setForm({ ...form, artistName: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  required
                />
              </div>
            </div>

            {/* Spotify Mode */}
            {bookingMode === "spotify" && (
              <div className="space-y-3 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <Label className="text-zinc-300">Search Spotify Tracks</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Song title or artist..."
                    value={spotifyQuery}
                    onChange={(e) => setSpotifyQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSpotifySearch()}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  />
                  <Button
                    type="button"
                    onClick={handleSpotifySearch}
                    disabled={searchingSpotify}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {searchingSpotify ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                  </Button>
                </div>

                {/* Search Results */}
                {spotifyResults.length > 0 && !spotifyTrack && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {spotifyResults.map((track) => (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => {
                          setSpotifyTrack(track);
                          setSpotifyResults([]);
                          setSpotifyQuery("");
                        }}
                        className="w-full flex items-center gap-3 p-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition-colors text-left"
                      >
                        {track.album?.images?.[0]?.url && (
                          <img
                            src={track.album.images[0].url}
                            alt={track.name}
                            className="w-10 h-10 rounded flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{track.name}</p>
                          <p className="text-xs text-zinc-400 truncate">
                            {track.artists?.map((a) => a.name).join(", ")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Track */}
                {spotifyTrack && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-700">
                    {spotifyTrack.album?.images?.[0]?.url && (
                      <img
                        src={spotifyTrack.album.images[0].url}
                        alt={spotifyTrack.name}
                        className="w-12 h-12 rounded"
                      />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-white">{spotifyTrack.name}</p>
                      <p className="text-xs text-zinc-400">
                        {spotifyTrack.artists?.map((a) => a.name).join(", ")}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSpotifyTrack(null)}
                      className="ml-auto text-xs text-zinc-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Upload Mode */}
            {bookingMode === "upload" && (
              <div className="space-y-2">
                <Label htmlFor="audio" className="text-zinc-300">
                  Audio File (30 seconds max)
                </Label>
                {audioFile ? (
                  <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 flex items-center gap-2">
                    <Music className="h-4 w-4 text-orange-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{audioFile.name}</p>
                      <p className="text-xs text-zinc-500">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    {uploading && <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />}
                    {!uploading && audioUrl && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                ) : (
                  <label className="block">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                    />
                    <div className="bg-zinc-800 border-2 border-dashed border-zinc-700 hover:border-orange-500 rounded-lg p-6 text-center cursor-pointer transition-colors">
                      <Music className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
                      <p className="text-sm text-zinc-300">Click to upload audio</p>
                      <p className="text-xs text-zinc-500">MP3, WAV, OGG (max 50MB)</p>
                    </div>
                  </label>
                )}
                {uploadError && <p className="text-sm text-red-400">{uploadError}</p>}
              </div>
            )}

            {/* Booking Date */}
            <div className="space-y-2">
              <Label htmlFor="bookingDate" className="text-zinc-300">
                Booking Date
              </Label>
              <Input
                id="bookingDate"
                type="date"
                value={form.bookingDate}
                onChange={(e) => setForm({ ...form, bookingDate: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-white"
                required
              />
            </div>

            {/* Price Info */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-300">Booking Price</p>
                  <p className="text-2xl font-bold text-white">$20</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-400">per day</p>
                  <p className="text-sm text-orange-400">30-second rotation</p>
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <label className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition-colors">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 accent-orange-500"
              />
              <span className="text-sm text-zinc-300">
                I confirm I own all rights to this audio, it contains no explicit or offensive content, and I agree to Gymtality's Artist Placement Terms. All bookings are subject to admin approval.
              </span>
            </label>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={
                processing ||
                uploading ||
                (bookingMode === "upload" && !audioUrl) ||
                (bookingMode === "spotify" && !spotifyTrack) ||
                !agreedToTerms
              }
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold h-10"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Book for $20"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      {recentBookings.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Your Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {booking.source === "spotify" && <Music className="h-3 w-3 text-green-500" />}
                      {booking.source === "upload" && <Music className="h-3 w-3 text-blue-500" />}
                      <p className="text-sm font-semibold text-white">{booking.songName}</p>
                    </div>
                    <p className="text-xs text-zinc-400">{booking.artistName}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        booking.status === "ACTIVE"
                          ? "bg-green-500/20 text-green-400"
                          : booking.status === "PENDING_REVIEW"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {booking.status === "PENDING_REVIEW" ? "Pending Review" : booking.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
