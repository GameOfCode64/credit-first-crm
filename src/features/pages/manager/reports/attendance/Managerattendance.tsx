"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarIcon,
  ChevronDown,
  Download,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isWeekend,
  isSameDay,
} from "date-fns";
import { toast } from "sonner";

const AMBER = "#b98b08";

/* ─────────────────────────
   STATUS CONFIG
───────────────────────── */
const ATTENDANCE_STATUS = {
  PRESENT: { label: "Present", color: "#16a34a", bg: "#dcfce7" },
  ABSENT: { label: "Absent", color: "#dc2626", bg: "#fee2e2" },
  LATE: { label: "Late", color: "#f59e0b", bg: "#fef3c7" },
  HALF_DAY: { label: "Half Day", color: "#6366f1", bg: "#e0e7ff" },
  HOLIDAY: { label: "Holiday", color: "#94a3b8", bg: "#f1f5f9" },
} as const;

type AttStatus = keyof typeof ATTENDANCE_STATUS;

/* ─────────────────────────
   STAT CARD
───────────────────────── */
function StatCard({ label, value, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: bg }}
      >
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────
   ATTENDANCE BADGE
───────────────────────── */
function AttBadge({ status }: { status: AttStatus | null }) {
  if (!status) return <span className="text-gray-300 text-xs">—</span>;
  const cfg = ATTENDANCE_STATUS[status];
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

/* ─────────────────────────
   MAIN PAGE
───────────────────────── */
export default function ManagerAttendance() {
  const [month, setMonth] = useState<Date>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [empFilter, setEmpFilter] = useState<string>("all");
  const [downloading, setDownloading] = useState(false);

  /* ── Fetch employees ── */
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get("/users/employees")).data,
  });

  /* ── Fetch attendance for the month ── */
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["manager-attendance", format(month, "yyyy-MM"), empFilter],
    queryFn: async () =>
      (
        await api.get("/reports/attendance", {
          params: {
            from: startOfMonth(month).toISOString(),
            to: endOfMonth(month).toISOString(),
            employeeId: empFilter !== "all" ? empFilter : undefined,
          },
        })
      ).data,
  });

  /* attendanceData shape:
     {
       employees: [
         {
           id, name,
           records: { "2024-01-01": "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "HOLIDAY" }
           summary: { present, absent, late, halfDay, workingDays }
         }
       ],
       summary: { totalPresent, totalAbsent, avgAttendance }
     }
  */

  const allEmployees: any[] = attendanceData?.employees ?? [];
  const teamSummary = attendanceData?.summary ?? {};

  /* Days in selected month (exclude weekends for display) */
  const daysInMonth = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfMonth(month),
        end: endOfMonth(month),
      }).filter((d) => !isWeekend(d)),
    [month],
  );

  /* Filter by selected employee */
  const displayRows = useMemo(
    () =>
      empFilter === "all"
        ? allEmployees
        : allEmployees.filter((e: any) => e.id === empFilter),
    [allEmployees, empFilter],
  );

  /* Team-level stats */
  const stats = useMemo(() => {
    const present = displayRows.reduce(
      (s: number, e: any) => s + (e.summary?.present ?? 0),
      0,
    );
    const absent = displayRows.reduce(
      (s: number, e: any) => s + (e.summary?.absent ?? 0),
      0,
    );
    const late = displayRows.reduce(
      (s: number, e: any) => s + (e.summary?.late ?? 0),
      0,
    );
    const halfDay = displayRows.reduce(
      (s: number, e: any) => s + (e.summary?.halfDay ?? 0),
      0,
    );
    const working = daysInMonth.length;
    const avgPct =
      displayRows.length > 0
        ? Math.round((present / (displayRows.length * working)) * 100)
        : 0;
    return { present, absent, late, halfDay, working, avgPct };
  }, [displayRows, daysInMonth]);

  /* ── CSV Download ── */
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get("/reports/attendance/export", {
        params: {
          from: startOfMonth(month).toISOString(),
          to: endOfMonth(month).toISOString(),
          employeeId: empFilter !== "all" ? empFilter : undefined,
        },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance-${format(month, "yyyy-MM")}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Attendance report downloaded");
    } catch {
      toast.error("Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#f5f5f5]">
      {/* ── TOOLBAR ── */}
      <div className="flex-shrink-0 px-8 py-4 bg-white border-b flex items-center gap-4 flex-wrap">
        <h2 className="font-bold text-base text-gray-900">Attendance Report</h2>

        {/* Month picker */}
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
              <CalendarIcon className="w-4 h-4" />
              {format(month, "MMMM yyyy")}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={month}
              onSelect={(d) => {
                if (d) {
                  setMonth(d);
                  setDateOpen(false);
                }
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Employee filter */}
        <Select value={empFilter} onValueChange={setEmpFilter}>
          <SelectTrigger className="w-[200px] bg-white border-gray-200 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-400" />
              <SelectValue placeholder="All Employees" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Employees</SelectItem>
            {employees.map((e: any) => (
              <SelectItem key={e.id} value={e.id}>
                {e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        {/* Download */}
        <button
          onClick={handleDownload}
          disabled={downloading || isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
          style={{ backgroundColor: AMBER }}
        >
          <Download className="w-4 h-4" />
          {downloading ? "Downloading…" : "Download CSV"}
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="flex-shrink-0 px-8 py-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label="Present Days"
          value={stats.present}
          icon={CheckCircle2}
          color="#16a34a"
          bg="#dcfce7"
        />
        <StatCard
          label="Absent Days"
          value={stats.absent}
          icon={XCircle}
          color="#dc2626"
          bg="#fee2e2"
        />
        <StatCard
          label="Late Arrivals"
          value={stats.late}
          icon={Clock}
          color="#f59e0b"
          bg="#fef3c7"
        />
        <StatCard
          label="Half Days"
          value={stats.halfDay}
          icon={AlertCircle}
          color="#6366f1"
          bg="#e0e7ff"
        />
        <StatCard
          label="Avg Attendance"
          value={`${stats.avgPct}%`}
          icon={TrendingUp}
          color={AMBER}
          bg="#fef9ee"
        />
      </div>

      {/* ── ATTENDANCE TABLE ── */}
      <div className="flex-1 min-h-0 overflow-auto px-8 pb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div
                className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: AMBER }}
              />
            </div>
          ) : displayRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Users className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">
                No attendance data
              </p>
              <p className="text-xs mt-1 text-gray-400">
                Data will appear here once employees log attendance
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    {/* Sticky employee name column */}
                    <th className="text-left text-xs font-semibold text-gray-600 px-5 py-3.5 sticky left-0 bg-gray-50 z-10 min-w-[160px] border-r border-gray-200">
                      Employee
                    </th>
                    {/* Day columns */}
                    {daysInMonth.map((day) => (
                      <th
                        key={day.toISOString()}
                        className="text-center text-xs font-semibold text-gray-500 px-1 py-3.5 min-w-[48px]"
                      >
                        <div>{format(day, "EEE")}</div>
                        <div className="font-bold text-gray-700">
                          {format(day, "d")}
                        </div>
                      </th>
                    ))}
                    {/* Summary columns */}
                    <th className="text-center text-xs font-semibold text-gray-600 px-3 py-3.5 min-w-[60px] border-l border-gray-200 bg-gray-50 sticky right-0">
                      P
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-600 px-3 py-3.5 min-w-[60px] bg-gray-50 sticky right-0">
                      A
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-600 px-3 py-3.5 min-w-[60px] bg-gray-50 sticky right-0">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((emp: any, idx: number) => (
                    <tr
                      key={emp.id}
                      className={cn(
                        "border-b border-gray-100 hover:bg-gray-50/70",
                        idx === displayRows.length - 1 && "border-b-0",
                      )}
                    >
                      {/* Employee name */}
                      <td className="px-5 py-3 sticky left-0 bg-white border-r border-gray-100 z-10">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                            style={{ backgroundColor: AMBER }}
                          >
                            {emp.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-gray-900 truncate max-w-[100px]">
                            {emp.name}
                          </span>
                        </div>
                      </td>

                      {/* Day cells */}
                      {daysInMonth.map((day) => {
                        const key = format(day, "yyyy-MM-dd");
                        const status = emp.records?.[key] as
                          | AttStatus
                          | undefined;
                        const cfg = status ? ATTENDANCE_STATUS[status] : null;
                        return (
                          <td key={key} className="px-1 py-2 text-center">
                            {cfg ? (
                              <span
                                className="inline-block w-7 h-7 rounded-full text-[10px] font-bold flex items-center justify-center mx-auto"
                                style={{
                                  backgroundColor: cfg.bg,
                                  color: cfg.color,
                                }}
                                title={cfg.label}
                              >
                                {status === "PRESENT" && "P"}
                                {status === "ABSENT" && "A"}
                                {status === "LATE" && "L"}
                                {status === "HALF_DAY" && "H"}
                                {status === "HOLIDAY" && "—"}
                              </span>
                            ) : (
                              <span className="text-gray-200 text-xs">·</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Summary */}
                      <td className="px-3 py-3 text-center font-semibold text-green-700 border-l border-gray-100">
                        {emp.summary?.present ?? 0}
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-red-600">
                        {emp.summary?.absent ?? 0}
                      </td>
                      <td
                        className="px-3 py-3 text-center font-semibold"
                        style={{ color: AMBER }}
                      >
                        {emp.summary?.present != null && daysInMonth.length > 0
                          ? `${Math.round((emp.summary.present / daysInMonth.length) * 100)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-4 px-1 flex-wrap">
          {Object.entries(ATTENDANCE_STATUS).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                style={{ backgroundColor: cfg.bg, color: cfg.color }}
              >
                {key === "PRESENT" && "P"}
                {key === "ABSENT" && "A"}
                {key === "LATE" && "L"}
                {key === "HALF_DAY" && "H"}
                {key === "HOLIDAY" && "—"}
              </span>
              <span className="text-xs text-gray-500">{cfg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
