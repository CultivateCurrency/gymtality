"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/hooks/use-api";
import { useMutation } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SongBooking {
  id: string;
  songName: string;
  artistName: string;
  bookingDate: string;
  status: "PENDING_REVIEW" | "ACTIVE" | "REJECTED";
  source: "spotify" | "upload";
  userId: string;
  createdAt: string;
  spotifyTrackUri?: string;
  audioUrl?: string;
  spotifyCoverImage?: string;
  amount: number;
  stripePaymentId?: string;
  rejectionReason?: string;
}

export default function MusicBookingsPage() {
  const [bookings, setBookings] = useState<SongBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"PENDING_REVIEW" | "ACTIVE" | "REJECTED" | "ALL">("PENDING_REVIEW");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const { fetch: fetchBookings } = useApi();
  const { mutate: approveBooking } = useMutation();
  const { mutate: rejectBooking } = useMutation();

  // Fetch bookings
  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        const url =
          filter === "ALL"
            ? "/api/landing/admin/bookings"
            : `/api/landing/admin/bookings?status=${filter}`;

        const data = await fetchBookings(url);
        setBookings(data.data?.bookings || []);
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [filter]);

  const handleApprove = async (bookingId: string) => {
    try {
      setApprovingId(bookingId);
      const response = await approveBooking(
        `/api/landing/admin/bookings/${bookingId}/approve`,
        "POST",
        {}
      );

      if (response.success) {
        toast.success("Booking approved! Song will play in rotation.");
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "ACTIVE" } : b))
        );
      } else {
        toast.error(response.error || "Failed to approve booking");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to approve booking");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      setRejectingId(null);
      const response = await rejectBooking(
        `/api/landing/admin/bookings/${bookingId}/reject`,
        "POST",
        { rejectionReason: rejectReason }
      );

      if (response.success) {
        toast.success("Booking rejected and refunded.");
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? { ...b, status: "REJECTED", rejectionReason: rejectReason }
              : b
          )
        );
        setRejectReason("");
      } else {
        toast.error(response.error || "Failed to reject booking");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to reject booking");
    }
  };

  const pendingCount = bookings.filter((b) => b.status === "PENDING_REVIEW").length;
  const activeCount = bookings.filter((b) => b.status === "ACTIVE").length;
  const rejectedCount = bookings.filter((b) => b.status === "REJECTED").length;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Music Booking Approvals</h1>
        <p className="text-zinc-400">Review and approve songs for landing page rotation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
              <p className="text-sm text-zinc-400 mt-1">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{activeCount}</p>
              <p className="text-sm text-zinc-400 mt-1">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{rejectedCount}</p>
              <p className="text-sm text-zinc-400 mt-1">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["PENDING_REVIEW", "ACTIVE", "REJECTED", "ALL"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? "bg-orange-500 text-white"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            {status === "PENDING_REVIEW" ? "Pending" : status}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin mx-auto mb-2" />
            <p className="text-zinc-400">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <p className="text-center text-zinc-400">No bookings to show</p>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className="bg-zinc-900 border-zinc-800">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Song Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Cover Image or Icon */}
                      <div className="flex-shrink-0">
                        {booking.spotifyCoverImage ? (
                          <img
                            src={booking.spotifyCoverImage}
                            alt={booking.songName}
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                            <Music className="h-8 w-8 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Song Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">{booking.songName}</h3>
                        <p className="text-sm text-zinc-400">{booking.artistName}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
                          <span>
                            📅 {new Date(booking.bookingDate).toLocaleDateString()}
                          </span>
                          <span>
                            {booking.source === "spotify" ? "🎵 Spotify" : "📤 Upload"}
                          </span>
                          <span className="text-orange-400 font-semibold">💰 $20</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex flex-col items-end gap-3">
                    {/* Status Badge */}
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        booking.status === "ACTIVE"
                          ? "bg-green-500/20 text-green-400"
                          : booking.status === "PENDING_REVIEW"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {booking.status === "PENDING_REVIEW"
                        ? "Pending Review"
                        : booking.status}
                    </span>

                    {/* Actions */}
                    {booking.status === "PENDING_REVIEW" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(booking.id)}
                          disabled={approvingId === booking.id}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                        >
                          {approvingId === booking.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>

                        {rejectingId === booking.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Reason..."
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              className="text-xs bg-zinc-800 border border-zinc-700 text-white rounded px-2 py-1 w-40"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleReject(booking.id);
                                }
                              }}
                            />
                            <Button
                              onClick={() => handleReject(booking.id)}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs h-8"
                            >
                              <Loader2 className="h-3 w-3 animate-spin" />
                            </Button>
                            <Button
                              onClick={() => {
                                setRejectingId(null);
                                setRejectReason("");
                              }}
                              className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs h-8"
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setRejectingId(booking.id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs h-8"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        )}
                      </div>
                    )}

                    {booking.status === "REJECTED" && booking.rejectionReason && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded p-2 text-xs text-red-300 max-w-xs">
                        <p className="font-semibold mb-1">Reason:</p>
                        <p>{booking.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
