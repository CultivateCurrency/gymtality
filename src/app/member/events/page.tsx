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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  QrCode,
  Ticket,
} from "lucide-react";
import { useApi, apiFetch } from "@/hooks/use-api";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

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

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

function generateICSFile(event: EventItem) {
  const start = new Date(event.startTime).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(event.endTime).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Gymtality//Events//EN",
    "BEGIN:VEVENT",
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ""}`,
    `LOCATION:${event.location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, "_")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
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

interface BookingItem {
  id: string;
  eventId: string;
  status: string;
  qrCode: string | null;
  bookedAt: string;
  event: { id: string; title: string; startTime: string; endTime: string; location: string | null; type: string };
}

interface EventsResponse {
  events: EventItem[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export default function EventsPage() {
  const now = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("All");
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [calYear, setCalYear] = useState(now.getFullYear());
  const { user } = useAuthStore();
  const [selectedQR, setSelectedQR] = useState<{ eventTitle: string; qrCode: string } | null>(null);

  const userId = user?.id;
  const { data: bookingsData } = useApi<BookingItem[]>(userId ? `/api/events/bookings?userId=${userId}` : null);
  const myBookings = bookingsData ?? [];

  const typeParam = activeFilter !== "All" ? filterToType(activeFilter) : null;
  const url = `/api/events?upcoming=true&page=1&limit=20${typeParam ? `&type=${typeParam}` : ""}`;
  const { data, loading, error, refetch } = useApi<EventsResponse>(url);

  const events = data?.events ?? [];

  const handleRSVP = async (eventId: string) => {
    if (!userId) return;
    try {
      await apiFetch(`/api/events/${eventId}/book`, {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      refetch();
      toast.success("Event booked successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to book event");
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else { setCalMonth(calMonth - 1); }
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else { setCalMonth(calMonth + 1); }
  };

  // Get events for the displayed month
  const monthEvents = events.filter((e) => {
    const d = new Date(e.startTime);
    return d.getMonth() === calMonth && d.getFullYear() === calYear;
  });

  // Build calendar grid
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const eventsByDay: Record<number, EventItem[]> = {};
  for (const e of monthEvents) {
    const day = new Date(e.startTime).getDate();
    if (!eventsByDay[day]) eventsByDay[day] = [];
    eventsByDay[day].push(e);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Events & Calendar</h1>
          <p className="text-zinc-400 mt-1">Browse classes, workshops, and community events.</p>
        </div>
      </div>

      {/* Calendar Controls */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={prevMonth}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-white min-w-[160px] text-center">
                {MONTHS[calMonth]} {calYear}
              </h2>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800" onClick={nextMonth}>
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

          {/* Mini Calendar Grid */}
          <div className="mt-4">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-center text-xs text-zinc-500 py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`text-center py-2 rounded-lg text-sm ${
                    day === null ? "" :
                    day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear()
                      ? "bg-orange-500 text-white font-bold"
                      : eventsByDay[day]
                        ? "bg-zinc-800 text-white font-medium"
                        : "text-zinc-500"
                  }`}
                >
                  {day || ""}
                  {day && eventsByDay[day] && (
                    <div className="flex justify-center mt-0.5">
                      <div className="w-1 h-1 rounded-full bg-orange-400" />
                    </div>
                  )}
                </div>
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

      {/* My Bookings */}
      {myBookings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="h-5 w-5 text-orange-500" />
            My Bookings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myBookings.filter((b) => b.status !== "CANCELLED").map((booking) => (
              <Card key={booking.id} className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{booking.event.title}</p>
                      <p className="text-xs text-zinc-400">{formatEventDate(booking.event.startTime)}</p>
                      <Badge className={`mt-1 text-xs ${
                        booking.status === "BOOKED" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        booking.status === "ATTENDED" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                        "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      }`}>
                        {booking.status}
                      </Badge>
                    </div>
                    {booking.qrCode && booking.status === "BOOKED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                        onClick={() => setSelectedQR({ eventTitle: booking.event.title, qrCode: booking.qrCode! })}
                      >
                        <QrCode className="h-4 w-4 mr-1" />
                        Check-in QR
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Event Cards */}
      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => {
            const spotsLeft = event.capacity - event._count.bookings;
            const isBooked = myBookings.some((b) => b.eventId === event.id && b.status !== "CANCELLED");
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
                  <div className="flex gap-2 mt-2">
                    <Button
                      className={`flex-1 ${isBooked ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600"} text-white`}
                      disabled={isBooked || spotsLeft <= 0}
                      onClick={() => handleRSVP(event.id)}
                    >
                      {isBooked ? "Booked" : spotsLeft > 0 ? "RSVP" : "Waitlist"}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      onClick={() => generateICSFile(event)}
                    >
                      <CalendarPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={!!selectedQR} onOpenChange={() => setSelectedQR(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-center">Check-in QR Code</DialogTitle>
          </DialogHeader>
          {selectedQR && (
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-sm text-zinc-400 text-center">{selectedQR.eventTitle}</p>
              <div className="bg-white p-6 rounded-xl">
                <svg viewBox="0 0 200 200" className="w-48 h-48">
                  {/* QR Code visual representation using the code as seed */}
                  {(() => {
                    const code = selectedQR.qrCode;
                    const cells: JSX.Element[] = [];
                    const size = 25;
                    const cellSize = 200 / size;
                    // Generate deterministic pattern from qrCode string
                    for (let y = 0; y < size; y++) {
                      for (let x = 0; x < size; x++) {
                        const charCode = code.charCodeAt((y * size + x) % code.length);
                        const isFinder = (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
                        const isFinderInner = (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
                          (x >= size - 5 && x <= size - 3 && y >= 2 && y <= 4) ||
                          (x >= 2 && x <= 4 && y >= size - 5 && y <= size - 3);
                        const isFinderBorder = isFinder && !isFinderInner &&
                          ((x < 7 && y < 7 && (x === 0 || x === 6 || y === 0 || y === 6)) ||
                          (x >= size - 7 && y < 7 && (x === size - 1 || x === size - 7 || y === 0 || y === 6)) ||
                          (x < 7 && y >= size - 7 && (x === 0 || x === 6 || y === size - 1 || y === size - 7)));
                        const filled = isFinderBorder || isFinderInner || (!isFinder && (charCode + x * 3 + y * 7) % 3 !== 0);
                        if (filled) {
                          cells.push(
                            <rect key={`${x}-${y}`} x={x * cellSize} y={y * cellSize} width={cellSize} height={cellSize} fill="#000" />
                          );
                        }
                      }
                    }
                    return cells;
                  })()}
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-500 font-mono break-all px-4">{selectedQR.qrCode}</p>
                <p className="text-xs text-zinc-500 mt-2">Show this code at the event entrance</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
