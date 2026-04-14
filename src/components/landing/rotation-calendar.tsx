"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Music } from "lucide-react";

interface RotationDay {
  date: string;
  dayName: string;
  availableSlots: number;
  songs: Array<{
    songName: string;
    artistName: string;
    type: "theme" | "paid";
  }>;
}

export function RotationCalendar() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [days, setDays] = useState<RotationDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch availability for next 5 days
    const fetchDays = async () => {
      setLoading(true);
      const daysData: RotationDay[] = [];

      for (let i = 0; i < 5; i++) {
        const date = new Date(currentDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];

        try {
          // Get available slots
          const availRes = await fetch(
            `/api/landing/bookings/availability?date=${dateStr}`
          );
          const availData = await availRes.json();
          const availableSlots = availData.data?.availableSlots || 0;

          // Get rotation queue for this date
          const rotRes = await fetch(`/api/landing/rotation?date=${dateStr}`);
          const rotData = await rotRes.json();
          const songs = rotData.data?.queue || [];

          daysData.push({
            date: dateStr,
            dayName: date.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            availableSlots,
            songs: songs.map((s: any) => ({
              songName: s.songName,
              artistName: s.artistName,
              type: s.type,
            })),
          });
        } catch (err) {
          console.error("Failed to fetch day data:", err);
        }
      }

      setDaysData(daysData);
      if (daysData.length > 0) {
        setSelectedDate(daysData[0].date);
      }
      setLoading(false);
    };

    fetchDays();
  }, [currentDate]);

  const selectedDay = days.find((d) => d.date === selectedDate);
  const booked = (selectedDay?.songs.length || 0) - 1; // Exclude theme song
  const capacity = Math.max(4, 5 - 1); // Min 4 user songs + 1 theme

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-12 px-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          🎵 Song Rotation Schedule
        </h2>
        <p className="text-zinc-400">
          See which songs are rotating and book your own
        </p>
      </div>

      {/* Date Selector */}
      <div className="grid grid-cols-5 gap-2">
        {days.map((day) => (
          <button
            key={day.date}
            onClick={() => setSelectedDate(day.date)}
            className={`p-3 rounded-lg border transition-all ${
              selectedDate === day.date
                ? "bg-orange-500/20 border-orange-500 text-white"
                : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
            }`}
          >
            <p className="text-xs font-semibold">{day.dayName.split(",")[0]}</p>
            <p className="text-sm font-bold mt-1">
              {day.dayName.split(" ")[1]}
            </p>
            <p className="text-xs mt-2 text-zinc-400">
              {Math.max(0, capacity - day.songs.length)} slots
            </p>
          </button>
        ))}
      </div>

      {/* Selected Day Details */}
      {selectedDay && (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-zinc-400 uppercase tracking-wide">
                {selectedDay.dayName}
              </p>
              <h3 className="text-xl font-bold text-white">
                Today's Rotation
              </h3>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-500">
                {selectedDay.songs.length}
              </p>
              <p className="text-xs text-zinc-400">songs</p>
            </div>
          </div>

          {/* Songs List */}
          <div className="space-y-2">
            {selectedDay.songs.length > 0 ? (
              selectedDay.songs.map((song, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-lg bg-zinc-700/50 border border-zinc-600"
                >
                  <Music
                    className={`h-4 w-4 flex-shrink-0 ${
                      song.type === "theme"
                        ? "text-yellow-500"
                        : "text-blue-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {song.songName}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {song.artistName}
                    </p>
                  </div>
                  {song.type === "theme" && (
                    <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-300 whitespace-nowrap">
                      Gymtality Theme
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-zinc-400 text-sm text-center py-4">
                Only the Gymtality theme song is playing this day
              </p>
            )}
          </div>

          {/* Availability Info */}
          <div className="pt-4 border-t border-zinc-600">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-300">Available Slots</p>
              <p className="text-sm font-bold text-orange-400">
                {Math.max(0, capacity - booked)} / {capacity}
              </p>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (booked / capacity) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              {booked} of {capacity} user songs booked
            </p>
          </div>

        </div>
      )}

      {/* Info */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
        <p className="text-xs text-zinc-400">
          💡 Each booked song rotates for 30 seconds alongside Gymtality's theme song
        </p>
      </div>
    </div>
  );
}
