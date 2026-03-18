"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Radio,
  Play,
  Clock,
  Eye,
  Video,
  CalendarDays,
  Users,
} from "lucide-react";

type StreamAccess = "PUBLIC" | "MEMBERS_ONLY" | "PPV";

interface StreamItem {
  id: string;
  title: string;
  host: string;
  viewers: number;
  access: StreamAccess;
  price?: number;
  date?: string;
  time?: string;
  duration?: string;
  thumbnail?: string;
}

const LIVE_STREAMS: StreamItem[] = [
  {
    id: "1",
    title: "Morning Bootcamp LIVE",
    host: "Coach Mike",
    viewers: 142,
    access: "MEMBERS_ONLY",
  },
  {
    id: "2",
    title: "Calisthenics Fundamentals",
    host: "Alex Rivera",
    viewers: 58,
    access: "PUBLIC",
  },
];

const UPCOMING_STREAMS: StreamItem[] = [
  {
    id: "3",
    title: "Advanced Kettlebell Flow",
    host: "Coach Sarah",
    viewers: 0,
    access: "MEMBERS_ONLY",
    date: "Mar 18, 2026",
    time: "5:00 PM",
  },
  {
    id: "4",
    title: "Pro Athlete Q&A Session",
    host: "Guest: Jordan Blake",
    viewers: 0,
    access: "PPV",
    price: 9.99,
    date: "Mar 21, 2026",
    time: "7:00 PM",
  },
];

const ON_DEMAND: StreamItem[] = [
  {
    id: "5",
    title: "Full Body Dumbbell Workout",
    host: "Coach Mike",
    viewers: 1240,
    access: "MEMBERS_ONLY",
    duration: "45 min",
  },
  {
    id: "6",
    title: "Beginner Yoga Flow",
    host: "Coach Priya",
    viewers: 890,
    access: "PUBLIC",
    duration: "30 min",
  },
  {
    id: "7",
    title: "Nutrition Masterclass",
    host: "Dr. Emily Tran",
    viewers: 2100,
    access: "PPV",
    price: 4.99,
    duration: "1h 15min",
  },
];

const ACCESS_STYLES: Record<StreamAccess, string> = {
  PUBLIC: "bg-green-500/20 text-green-400 border-green-500/30",
  MEMBERS_ONLY: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  PPV: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

function StreamCard({ stream, isLive }: { stream: StreamItem; isLive?: boolean }) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition group">
      <CardContent className="pt-4 space-y-3">
        {/* Thumbnail Placeholder */}
        <div className="relative h-40 bg-zinc-800 rounded-lg flex items-center justify-center overflow-hidden">
          <Video className="h-10 w-10 text-zinc-600" />
          {isLive && (
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-red-600 px-2 py-0.5 rounded text-xs font-bold text-white">
              <Radio className="h-3 w-3 animate-pulse" />
              LIVE
            </div>
          )}
          {stream.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs text-white">
              {stream.duration}
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition">
            <Play className="h-12 w-12 text-white opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white text-sm leading-tight">{stream.title}</h3>
            <Badge className={`shrink-0 ${ACCESS_STYLES[stream.access]}`}>
              {stream.access.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-zinc-400">{stream.host}</p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            {isLive && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {stream.viewers} watching
              </span>
            )}
            {!isLive && stream.viewers > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {stream.viewers.toLocaleString()} views
              </span>
            )}
            {stream.date && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {stream.date} at {stream.time}
              </span>
            )}
            {stream.price && (
              <span className="text-amber-400 font-semibold">${stream.price}</span>
            )}
          </div>
        </div>

        <Button
          className={`w-full ${
            isLive
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-orange-500 hover:bg-orange-600 text-white"
          }`}
        >
          {isLive ? "Join Stream" : stream.price ? `Buy — $${stream.price}` : "Watch"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function StreamingPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Streaming</h1>
          <p className="text-zinc-400 mt-1">Watch live workouts, replays, and exclusive content.</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Video className="h-4 w-4 mr-2" />
          Go Live
        </Button>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="live" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Radio className="h-4 w-4 mr-2" />
            Live Now
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-2" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="ondemand" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Play className="h-4 w-4 mr-2" />
            On Demand
          </TabsTrigger>
        </TabsList>

        {/* Live Now */}
        <TabsContent value="live" className="mt-4">
          {LIVE_STREAMS.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LIVE_STREAMS.map((stream) => (
                <StreamCard key={stream.id} stream={stream} isLive />
              ))}
            </div>
          ) : (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-12 text-center">
                <Radio className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">No live streams right now. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Upcoming */}
        <TabsContent value="upcoming" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {UPCOMING_STREAMS.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        </TabsContent>

        {/* On Demand */}
        <TabsContent value="ondemand" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ON_DEMAND.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
