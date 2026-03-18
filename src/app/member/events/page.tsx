"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  CalendarPlus,
  Loader2,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";
import { useSession } from "next-auth/react";

type ViewMode = "month" | "week" | "day";
type EventType = "LIVE_CLASS" | "IN_PERSON" | "WORKSHOP";
type FilterCategory = "All" | "Classes" | "Gym Events" | "Livestreams" | "Challenges" | "Personal Sessions";

const TYPE_STYLES: Record<EventType, string> = {
  LIVE_CLASS: "bg-red-500/20 text-red-400 border-red-500/30",
  IN_PERSON: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  WORKSHOP: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const FILTER_CATEGORIES: FilterCategory[] = [
  "All", "Classes", "Gym Events", "Livestreams", "Challenges", "Personal Sessions",
];

function filterToType(filter: string): string | null {
  const map: Record<string, string> = { Classes: "LIVE_CLASS", "Gym Events": "IN_PERSON", Livestreams: "LIVE_CLASS", Challenges: "WORKSHOP" };
  return map[filter] || null;
}

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatEventTime(start: string, end: string) {
  return `${new Date(start).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - ${new Date(end).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

interface EventItem {
  id: string;
  title: string;
  type: EventType;
  description: string | null;
  startTime: string;
  endTime: string;
  location: string | null;
  capacity: number;
  price: number;
  hostId: string;
  _count: { bookings: number };
}

interface EventsResponse {
  events: EventItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function EventsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("All");
  const { data: session } = useSession();

  const typeParam = activeFilter !== "All" ? filterToType(activeFilter) : null;
  const url = `/api/events?upcoming=true&page=1&limit=20${typeParam ? `&type=${typeParam}` : ""}`;
  const { data, loading, error, refetch } = useApi<EventsResponse>(url);

  const events = data?.events ?? [];

  const handleRSVP = async (eventId: string) => {
    const userId = (session?.user as any)?.id;
    if (!userId) return;
    try {
      await apiFetch(`/api/events/${eventId}/book`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      refetch();
    } catch {
      // handle error silently for now
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Events & Calendar</h1>
          <p className="text-zinc-400 mt-1">Browse classes, workshops, and community events.</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <CalendarPlus className="h-4 w-4 mr-2" />
          Add to Calendar
        </Button>
      </div>

      {/* Calendar Controls */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-white min-w-[160px] text-center">
                March 2026
              </h2>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex bg-zinc-800 rounded-lg p-1">
              {(["month", "week", "day"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                    viewMode === mode
                      ? "bg-orange-500 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-zinc-400" />
        {FILTER_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              activeFilter === cat
                ? "bg-orange-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load events. Please try again.</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && events.length === 0 && (
        <div className="text-center py-12">
          <CalendarDays className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400">No upcoming events found.</p>
        </div>
      )}

      {/* Event Cards */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const spotsLeft = event.capacity - event._count.bookings;
            return (
              <Card key={event.id} className="bg-zinc-900 border-zinc-800 hover:border-orange-500/50 transition">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className={TYPE_STYLES[event.type] || "bg-zinc-700 text-zinc-300"}>
                        {event.type.replace("_", " ")}
                      </Badge>
                      <CardTitle className="text-white text-lg mt-2">{event.title}</CardTitle>
                    </div>
                    {event.price > 0 ? (
                      <span className="text-lg font-bold text-orange-500">${event.price}</span>
                    ) : (
                      <span className="text-sm font-medium text-green-400">FREE</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.description && (
                    <p className="text-sm text-zinc-400">{event.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <CalendarDays className="h-4 w-4 text-zinc-500" />
                      {formatEventDate(event.startTime)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <Clock className="h-4 w-4 text-zinc-500" />
                      {formatEventTime(event.startTime, event.endTime)}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <MapPin className="h-4 w-4 text-zinc-500" />
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <Users className="h-4 w-4 text-zinc-500" />
                      <span>
                        {spotsLeft} / {event.capacity} spots left
                      </span>
                      {spotsLeft <= 5 && spotsLeft > 0 && (
                        <span className="text-xs text-red-400 font-medium">Almost full!</span>
                      )}
                    </div>
                  </div>
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white mt-2"
                    disabled={spotsLeft <= 0}
                    onClick={() => handleRSVP(event.id)}
                  >
                    {spotsLeft > 0 ? "RSVP" : "Waitlist"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
