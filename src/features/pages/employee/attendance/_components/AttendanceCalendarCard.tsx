import React from "react";
import { Calendar } from "../../../../../components/ui/calendar";
import { useQuery } from "@tanstack/react-query";
import { fetchMyAttendance } from "../../../../../services/attendance.service";

export default function AttendanceCalendarCard() {
  const { data = [] } = useQuery({
    queryKey: ["attendance-history"],
    queryFn: fetchMyAttendance,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const presentDays = data.map((a: any) => new Date(a.date).toDateString());

  return (
    <div className="rounded-xl border bg-white p-6 flex items-center justify-center flex-col">
      <h3 className="font-semibold mb-3 ">Attendance Calendar</h3>

      <Calendar
        mode="single"
        className=""
        modifiers={{
          present: (date) => presentDays.includes(date.toDateString()),
        }}
        modifiersClassNames={{
          present: "text-green-700 bg-green-500/10",
        }}
      />

      <p className="text-xs text-muted-foreground mt-2">
        Green dates indicate present days
      </p>
    </div>
  );
}
