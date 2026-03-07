import React from "react";
import { Calendar } from "../../../../../components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { fetchMyAttendanceHistory } from "../../../../../services/attendance.service";
import type { AttendanceRecord } from "../../../../../services/attendance.service";

export default function AttendanceCalendarCard() {
  const { data = [] } = useQuery({
    queryKey: ["attendance-history"],
    queryFn: fetchMyAttendanceHistory,
  });

  // Build sets for different day states
  const presentDays = new Set<string>();
  const incompleteDays = new Set<string>();

  (data as AttendanceRecord[]).forEach((a) => {
    const key = new Date(a.date).toDateString();
    if (a.clockIn && a.clockOut) presentDays.add(key);
    else if (a.clockIn) incompleteDays.add(key);
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 flex flex-col items-center">
      <div className="w-full mb-4">
        <h3 className="font-semibold text-zinc-900">Attendance Calendar</h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Your presence over the last 30 days
        </p>
      </div>

      <Calendar
        mode="single"
        modifiers={{
          present: (date) => presentDays.has(date.toDateString()),
          incomplete: (date) => incompleteDays.has(date.toDateString()),
        }}
        modifiersClassNames={{
          present: "bg-emerald-100 text-emerald-800 font-semibold rounded-md",
          incomplete: "bg-amber-100 text-amber-800 font-semibold rounded-md",
        }}
      />

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
          Present
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" />
          Clocked in only
        </span>
      </div>
    </div>
  );
}
