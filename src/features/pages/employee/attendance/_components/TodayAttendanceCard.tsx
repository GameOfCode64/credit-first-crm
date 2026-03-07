import React, { useEffect, useState } from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  clockIn,
  clockOut,
  fetchMyAttendance,
} from "../../../../../services/attendance.service";
import toast from "react-hot-toast";

const fmt = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

export default function TodayAttendanceCard() {
  const qc = useQueryClient();

  // Live clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Today's attendance — single record { clockIn, clockOut } | { clockIn: null, clockOut: null }
  const { data: attendance, isLoading } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: fetchMyAttendance,
    refetchInterval: 30_000,
  });

  const hasClockIn = !!attendance?.clockIn;
  const hasClockOut = !!attendance?.clockOut;
  const done = hasClockIn && hasClockOut;

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["attendance-today"] });
    qc.invalidateQueries({ queryKey: ["attendance-history"] });
  };

  const clockInMutation = useMutation({
    mutationFn: clockIn,
    onSuccess: () => {
      toast.success("Checked in successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to check in"),
  });

  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      toast.success("Checked out successfully");
      invalidate();
    },
    onError: () => toast.error("Failed to check out"),
  });

  const loading =
    clockInMutation.isPending || clockOutMutation.isPending || isLoading;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-5">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-zinc-900">Today's Attendance</h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          Check in and out for the day
        </p>
      </div>

      {/* Clock */}
      <div className="flex flex-col items-center gap-1.5 py-2">
        <Clock size={36} className="text-[#b98b08]" />
        <p className="text-3xl font-bold text-zinc-900 tabular-nums">
          {now.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </p>
        <p className="text-sm text-zinc-400">
          {now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Clock-in / Clock-out times */}
      {(hasClockIn || hasClockOut) && (
        <div className="flex justify-around text-center border border-zinc-100 rounded-lg py-3 bg-zinc-50">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 mb-0.5">
              Clock In
            </p>
            <p className="text-sm font-semibold text-emerald-600">
              {fmt(attendance?.clockIn) ?? "—"}
            </p>
          </div>
          {hasClockOut && (
            <div>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400 mb-0.5">
                Clock Out
              </p>
              <p className="text-sm font-semibold text-zinc-600">
                {fmt(attendance?.clockOut) ?? "—"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action */}
      {!isLoading && !hasClockIn && (
        <Button
          onClick={() => clockInMutation.mutate()}
          disabled={loading}
          className="w-full bg-[#b98b08] hover:bg-[#a07a07] text-white font-semibold"
        >
          <LogIn className="mr-2 w-4 h-4" />
          {clockInMutation.isPending ? "Checking in…" : "Check In"}
        </Button>
      )}

      {!isLoading && hasClockIn && !hasClockOut && (
        <Button
          onClick={() => clockOutMutation.mutate()}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
        >
          <LogOut className="mr-2 w-4 h-4" />
          {clockOutMutation.isPending ? "Checking out…" : "Check Out"}
        </Button>
      )}

      {done && (
        <div className="text-center py-2 rounded-lg bg-emerald-50 border border-emerald-100">
          <p className="text-sm font-semibold text-emerald-700">
            ✔ Attendance completed for today
          </p>
        </div>
      )}
    </div>
  );
}
