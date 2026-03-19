"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useApi, useMutation } from "@/hooks/use-api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const viewerData = [
  { stream: "Stream 1", viewers: 45 },
  { stream: "Stream 2", viewers: 82 },
  { stream: "Stream 3", viewers: 63 },
  { stream: "Stream 4", viewers: 110 },
  { stream: "Stream 5", viewers: 95 },
  { stream: "Stream 6", viewers: 130 },
];
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Radio,
  Video,
  Calendar,
  Clock,
  Users,
  Eye,
  Play,
  DollarSign,
  TrendingUp,
  BarChart3,
  Zap,
  Loader2,
} from "lucide-react";

interface Stream {
  id: string;
  hostId: string;
  title: string;
  category: string | null;
  type: "PUBLIC" | "MEMBERS_ONLY" | "PAY_PER_VIEW" | "GROUP_ONLY";
  status: "SCHEDULED" | "LIVE" | "ENDED";
  replayUrl: string | null;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  price: number;
  viewerCount: number;
  createdAt: string;
}

function formatDuration(startedAt: string | null, endedAt: string | null): string {
  if (!startedAt || !endedAt) return "Scheduled";
  const diff = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function CoachStreamingPage() {
  const { data: session } = useSession();
  const { data: streams, loading, error, refetch } = useApi<Stream[]>(
    session?.user?.id ? "/api/streaming" : null
  );

  const { mutate: createStream, loading: creating } = useMutation<Stream, Record<string, unknown>>(
    "/api/streaming",
    "POST"
  );

  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamCategory, setStreamCategory] = useState("Workout");
  const [streamDate, setStreamDate] = useState("");
  const [streamTime, setStreamTime] = useState("");
  const [streamCapacity, setStreamCapacity] = useState("");
  const [streamPrice, setStreamPrice] = useState("");
  const [isFree, setIsFree] = useState(true);

  const pastStreams = useMemo(
    () => (streams ?? []).filter((s) => s.status === "ENDED"),
    [streams]
  );
  const scheduledStreams = useMemo(
    () => (streams ?? []).filter((s) => s.status === "SCHEDULED"),
    [streams]
  );
  const liveStreams = useMemo(
    () => (streams ?? []).filter((s) => s.status === "LIVE"),
    [streams]
  );

  const totalStreams = (streams ?? []).length;
  const totalViewers = (streams ?? []).reduce((sum, s) => sum + s.viewerCount, 0);
  const peakViewers = (streams ?? []).reduce((max, s) => Math.max(max, s.viewerCount), 0);

  async function handleSchedule() {
    if (!session?.user || !streamTitle || !streamDate || !streamTime) return;
    const userId = (session.user as any).id;
    const scheduledAt = new Date(`${streamDate}T${streamTime}`).toISOString();
    const result = await createStream({
      hostId: userId,
      title: streamTitle,
      category: streamCategory,
      scheduledAt,
      price: isFree ? 0 : Number(streamPrice) || 0,
    });
    if (result) {
      setShowScheduleForm(false);
      setStreamTitle("");
      setStreamCategory("Workout");
      setStreamDate("");
      setStreamTime("");
      setStreamCapacity("");
      setStreamPrice("");
      setIsFree(true);
      refetch();
    }
  }

  async function handleGoLive() {
    if (!session?.user) return;
    const result = await createStream({
      hostId: (session.user as any).id,
      title: "Live Stream",
      category: null,
      price: 0,
    });
    if (result) {
      alert(
        `Stream "${result.title}" created (ID: ${result.id}). Going live requires IVS integration — coming soon!`
      );
      refetch();
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Streaming</h1>
          <p className="text-zinc-400 mt-1">
            Go live, schedule classes, and review past streams.
          </p>
        </div>
        <Button
          onClick={handleGoLive}
          disabled={creating}
          className="bg-red-500 hover:bg-red-600 text-white gap-2 px-6 py-5 text-lg font-semibold"
        >
          {creating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Radio className="h-5 w-5 animate-pulse" />
          )}
          Go Live
        </Button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-12 text-zinc-400 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading streams...
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          Failed to load streams: {error}
        </div>
      )}

      {/* Live Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <Radio className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalStreams}</p>
                <p className="text-sm text-zinc-400">Total Streams</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Eye className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalViewers}</p>
                <p className="text-sm text-zinc-400">Total Viewers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{peakViewers}</p>
                <p className="text-sm text-zinc-400">Peak Viewers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Zap className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{liveStreams.length}</p>
                <p className="text-sm text-zinc-400">Currently Live</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule a Live Class */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              Schedule a Live Class
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowScheduleForm(!showScheduleForm)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              {showScheduleForm ? "Cancel" : "New Schedule"}
            </Button>
          </div>
        </CardHeader>
        {showScheduleForm && (
          <CardContent className="space-y-4 border-t border-zinc-800 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300">Title</label>
                <Input
                  placeholder="e.g., Evening HIIT Session"
                  value={streamTitle}
                  onChange={(e) => setStreamTitle(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300">Category</label>
                <select
                  value={streamCategory}
                  onChange={(e) => setStreamCategory(e.target.value)}
                  className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2 text-sm"
                >
                  <option>Workout</option>
                  <option>HIIT</option>
                  <option>Yoga</option>
                  <option>Meditation</option>
                  <option>Strength Training</option>
                  <option>Cardio</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300">Date</label>
                <Input
                  type="date"
                  value={streamDate}
                  onChange={(e) => setStreamDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300">Time</label>
                <Input
                  type="time"
                  value={streamTime}
                  onChange={(e) => setStreamTime(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-zinc-300">Capacity</label>
                <Input
                  type="number"
                  placeholder="50"
                  value={streamCapacity}
                  onChange={(e) => setStreamCapacity(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-zinc-300">Pricing</label>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsFree(true)}
                  className={
                    isFree
                      ? "border-green-500/30 text-green-400 hover:bg-green-500/10 bg-green-500/10"
                      : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  }
                >
                  Free
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsFree(false)}
                  className={
                    !isFree
                      ? "border-orange-500/30 text-orange-400 hover:bg-orange-500/10 bg-orange-500/10"
                      : "border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                  }
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Paid
                </Button>
                {!isFree && (
                  <Input
                    type="number"
                    placeholder="Price"
                    value={streamPrice}
                    onChange={(e) => setStreamPrice(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white max-w-[180px]"
                  />
                )}
              </div>
            </div>
            <Button
              onClick={handleSchedule}
              disabled={creating || !streamTitle || !streamDate || !streamTime}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scheduling...
                </>
              ) : (
                "Schedule Stream"
              )}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Scheduled Streams */}
      {scheduledStreams.length > 0 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Upcoming Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10">
                      <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{stream.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        {stream.category && (
                          <Badge className="bg-zinc-700 text-zinc-300 border-zinc-600 text-[10px]">
                            {stream.category}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formatDate(stream.scheduledAt)}
                        </span>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                          Scheduled
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {stream.price > 0 && (
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                        ${stream.price}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Streams */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Video className="h-5 w-5 text-orange-500" />
            Past Streams
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Review your previous streams and replay analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pastStreams.length === 0 && !loading ? (
            <p className="text-zinc-500 text-sm text-center py-8">
              No past streams yet. Go live or schedule your first stream!
            </p>
          ) : (
            <div className="space-y-3">
              {pastStreams.map((stream) => (
                <div
                  key={stream.id}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-800 hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-red-500/10">
                      <Video className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{stream.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                        {stream.category && (
                          <Badge className="bg-zinc-700 text-zinc-300 border-zinc-600 text-[10px]">
                            {stream.category}
                          </Badge>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{" "}
                          {formatDate(stream.endedAt || stream.startedAt || stream.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{" "}
                          {formatDuration(stream.startedAt, stream.endedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-medium text-white flex items-center gap-1 justify-end">
                        <Eye className="h-3 w-3 text-zinc-500" /> {stream.viewerCount}
                      </p>
                    </div>
                    {stream.replayUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        onClick={() => window.open(stream.replayUrl!, "_blank")}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Replay
                      </Button>
                    ) : (
                      <Badge className="bg-zinc-700 text-zinc-500 border-zinc-600">
                        No Replay
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Viewer Analytics Placeholder */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Viewer Analytics
          </CardTitle>
          <CardDescription className="text-zinc-400">
            Engagement metrics across your streams.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewerData}>
                <XAxis dataKey="stream" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid #27272a", borderRadius: 8, color: "#fff" }} />
                <Bar dataKey="viewers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
