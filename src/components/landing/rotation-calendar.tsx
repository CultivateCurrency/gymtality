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
    <div className="max-w-2xl mx-auto py-12 px-6">
      {/* Minimal Date Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {days.map((day) => (
          <button
            key={day.date}
            onClick={() => setSelectedDate(day.date)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg border text-sm transition-all ${
              selectedDate === day.date
                ? "bg-orange-500 border-orange-500 text-white"
                : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            {day.dayName.split(",")[0]} {day.dayName.split(" ")[1]}
          </button>
        ))}
      </div>

      {/* Songs List — Name & Artist Only */}
      {selectedDay && (
        <div className="space-y-2">
          {selectedDay.songs.length > 0 ? (
            selectedDay.songs.map((song, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
              >
                <Music
                  size={16}
                  className={`flex-shrink-0 ${
                    song.type === "theme" ? "text-yellow-500" : "text-orange-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {song.songName}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {song.artistName}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-zinc-500 text-sm">
                Only the Gymtality theme is playing this day
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
