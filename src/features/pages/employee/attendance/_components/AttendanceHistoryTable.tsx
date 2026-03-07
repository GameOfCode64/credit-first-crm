import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyAttendanceHistory } from "../../../../../services/attendance.service";
import type { AttendanceRecord } from "../../../../../services/attendance.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../../components/ui/table";

const fmtTime = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const hoursWorked = (
  clockIn: string | null,
  clockOut: string | null,
): string => {
  if (!clockIn || !clockOut) return "—";
  const diff =
    (new Date(clockOut).getTime() - new Date(clockIn).getTime()) / 3_600_000;
  return `${diff.toFixed(1)} hrs`;
};

const StatusBadge = ({
  clockIn,
  clockOut,
}: {
  clockIn: string | null;
  clockOut: string | null;
}) => {
  if (!clockIn)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-red-600 border border-red-100">
        Absent
      </span>
    );
  if (!clockOut)
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100">
        Incomplete
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
      Present
    </span>
  );
};

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableCell key={i}>
          <div className="h-3 rounded bg-zinc-100 animate-pulse w-24" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function AttendanceHistoryTable() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["attendance-history"],
    queryFn: fetchMyAttendanceHistory,
  });

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <h3 className="font-semibold text-zinc-900">Attendance History</h3>
      <p className="text-xs text-zinc-400 mt-0.5 mb-4">
        Your attendance log for the last 30 days
      </p>

      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50">
            <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
              Date
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
              Clock In
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
              Clock Out
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
              Hours
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-10 text-sm text-zinc-400"
              >
                No attendance records found
              </TableCell>
            </TableRow>
          ) : (
            data.map((row: AttendanceRecord) => (
              <TableRow
                key={row.id}
                className="hover:bg-zinc-50 transition-colors"
              >
                <TableCell className="text-sm font-medium text-zinc-700">
                  {fmtDate(row.date)}
                </TableCell>
                <TableCell className="text-sm text-emerald-600 font-medium">
                  {fmtTime(row.clockIn)}
                </TableCell>
                <TableCell className="text-sm text-zinc-600">
                  {fmtTime(row.clockOut)}
                </TableCell>
                <TableCell className="text-sm text-zinc-600">
                  {hoursWorked(row.clockIn, row.clockOut)}
                </TableCell>
                <TableCell>
                  <StatusBadge clockIn={row.clockIn} clockOut={row.clockOut} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
