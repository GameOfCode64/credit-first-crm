import React from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clockIn,
  clockOut,
  fetchMyAttendance,
} from "../../../../../services/attendance.service";
import toast from "react-hot-toast";

const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

export default function TodayAttendanceCard() {
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["attendance-history"],
    queryFn: fetchMyAttendance,
  });

  const today = new Date();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todayAttendance = data.find((a: any) =>
    isSameDay(new Date(a.date), today),
  );

  const clockInMutation = useMutation({
    mutationFn: clockIn,
    onSuccess: () => {
      toast.success("Checked in");
      qc.invalidateQueries({ queryKey: ["attendance-history"] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      toast.success("Checked out");
      qc.invalidateQueries({ queryKey: ["attendance-history"] });
    },
  });

  return (
    <div className="rounded-xl border bg-white p-6 space-y-6">
      <div>
        <h3 className="font-semibold">Today’s Attendance</h3>
        <p className="text-xs text-muted-foreground">
          Check in and out for the day
        </p>
      </div>

      <div className="flex flex-col items-center space-y-2">
        <Clock size={40} className="text-[#0f2454]" />
        <p className="text-3xl font-bold">
          {today.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-sm text-muted-foreground">{today.toDateString()}</p>
      </div>

      {!todayAttendance && (
        <Button
          onClick={() => clockInMutation.mutate()}
          className="bg-[#b98b08] hover:bg-[#b98b08]/90 w-full text-white"
        >
          <LogIn className="mr-2" /> Check In
        </Button>
      )}

      {todayAttendance?.clockIn && !todayAttendance?.clockOut && (
        <Button
          onClick={() => clockOutMutation.mutate()}
          className="bg-rose-700 hover:bg-rose-700/90  w-full text-white"
        >
          <LogOut className="mr-2" /> Check Out
        </Button>
      )}

      {todayAttendance?.clockOut && (
        <p className="text-center text-sm font-medium text-green-600">
          Attendance completed ✔
        </p>
      )}
    </div>
  );
}
