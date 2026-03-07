"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Phone,
  Clock,
  IndianRupee,
  Star,
  BarChart2,
  ChevronDown,
  CalendarIcon,
  Download,
  Users,
  X,
} from "lucide-react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { toast } from "sonner";

/* ─────────────────────────
   CONSTANTS
───────────────────────── */
type Period = "DAY" | "WEEK" | "MONTH" | "YEAR";
const AMBER = "#b98b08";
const AMBER_LIGHT = "#f0d89a";

/* ─────────────────────────
   HELPERS
───────────────────────── */
const formatDuration = (s: number) => {
  if (!s) return "0s";
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

const normalizeStages = (stage: any[] = []) =>
  stage.map((o: any) =>
    typeof o === "string" ? { id: o, name: o, color: "#94a3b8" } : o,
  );

const getStatusStyle = (status: string, allOutcomes: any[]) => {
  const s = allOutcomes.find((o: any) => o.name === status);
  if (s?.color)
    return {
      backgroundColor: s.color + "22",
      color: s.color,
      borderColor: s.color + "44",
    };
  return {
    backgroundColor: "#fef9ee",
    color: AMBER,
    borderColor: AMBER + "44",
  };
};

/* ─────────────────────────
   CHART TOOLTIP
───────────────────────── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700">{label}</p>
      <p style={{ color: AMBER }}>{payload[0]?.value} calls</p>
    </div>
  );
}

/* ─────────────────────────
   LEAD CARD
───────────────────────── */
function LeadCard({ lead, allOutcomes, selected, onClick }: any) {
  const statusStyle = getStatusStyle(lead.status, allOutcomes);
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
        selected && "bg-amber-50 border-l-[3px]",
      )}
      style={selected ? { borderLeftColor: AMBER } : {}}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-bold truncate"
            style={{ color: "#3b5bdb" }}
          >
            {lead.personName || lead.companyName || "Unknown"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{lead.phone}</p>

          {/* Assigned employee name — shown in manager view */}
          {lead.assignedTo?.name && (
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
              <Users className="w-3 h-3" /> {lead.assignedTo.name}
            </p>
          )}

          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-gray-500">Status:</span>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full border"
              style={statusStyle}
            >
              {lead.status}
            </span>
            <Star className="w-3.5 h-3.5 text-gray-300" />
          </div>

          {lead.campaign?.name && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-3.5 h-3.5 bg-green-600 rounded-sm flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">X</span>
              </div>
              <span className="text-[11px] text-gray-500 truncate">
                {lead.campaign.name}
              </span>
            </div>
          )}
        </div>

        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: AMBER }}
        >
          {lead.assignedTo?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────────
   MAIN PAGE
───────────────────────── */
export default function ManagerCallingReport() {
  const [period, setPeriod] = useState<Period>("DAY");
  const [customDate, setCustomDate] = useState<Date>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  /* Manager-only filters */
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all");
  const [downloading, setDownloading] = useState(false);

  /* ── Date range ── */
  const dateRange = useMemo(() => {
    const b = customDate;
    switch (period) {
      case "DAY":
        return {
          from: startOfDay(b),
          to: endOfDay(b),
          label: format(b, "dd MMM yyyy"),
        };
      case "WEEK":
        return {
          from: startOfWeek(b, { weekStartsOn: 1 }),
          to: endOfWeek(b, { weekStartsOn: 1 }),
          label: `Week of ${format(startOfWeek(b, { weekStartsOn: 1 }), "dd MMM")}`,
        };
      case "MONTH":
        return {
          from: startOfMonth(b),
          to: endOfMonth(b),
          label: format(b, "MMMM yyyy"),
        };
      case "YEAR":
        return {
          from: startOfYear(b),
          to: endOfYear(b),
          label: format(b, "yyyy"),
        };
    }
  }, [period, customDate]);

  /* ── Fetch employees for filter dropdown ── */
  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await api.get("/users/employees")).data,
  });

  /* ── Fetch report data ── */
  const { data: reportData, isLoading } = useQuery({
    queryKey: [
      "manager-calling-report",
      period,
      dateRange.from.toISOString(),
      selectedEmployeeId,
    ],
    queryFn: async () =>
      (
        await api.get("/reports/team-calls", {
          params: {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
            period,
            employeeId:
              selectedEmployeeId !== "all" ? selectedEmployeeId : undefined,
          },
        })
      ).data,
  });

  /* ── Pipeline for status colours ── */
  const { data: pipeline } = useQuery({
    queryKey: ["pipeline"],
    queryFn: async () => (await api.get("/pipeline")).data,
  });

  const initialStages = normalizeStages(pipeline?.initialStage);
  const activeStages = normalizeStages(pipeline?.activeStage);
  const closedStages = normalizeStages(pipeline?.closedStage);
  const allOutcomes = [...initialStages, ...activeStages, ...closedStages];

  const stats = {
    calls: reportData?.totalCalls ?? 0,
    duration: reportData?.totalDuration ?? 0,
    sales: reportData?.totalSales ?? 0,
  };
  const chartData: { label: string; calls: number }[] =
    reportData?.chartData ?? [];
  const leads: any[] = reportData?.leads ?? [];
  const maxCalls = Math.max(...chartData.map((d) => d.calls), 1);

  const selectedEmployee = employees.find(
    (e: any) => e.id === selectedEmployeeId,
  );

  const periodLabel = {
    DAY: format(customDate, "dd MMM") + " Calls Report",
    WEEK: "This Week Calls Report",
    MONTH: format(customDate, "MMMM") + " Calls Report",
    YEAR: format(customDate, "yyyy") + " Calls Report",
  }[period];

  /* ── CSV Download ── */
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get("/reports/team-calls/export", {
        params: {
          from: dateRange.from.toISOString(),
          to: dateRange.to.toISOString(),
          period,
          employeeId:
            selectedEmployeeId !== "all" ? selectedEmployeeId : undefined,
        },
        responseType: "blob",
      });

      const url = URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `calling-report-${format(customDate, "yyyy-MM-dd")}-${selectedEmployeeId === "all" ? "all" : (selectedEmployee?.name ?? "employee")}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded");
    } catch {
      toast.error("Failed to download report");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {/* ═══════════════════════════════════════════
          LEFT — Stats + Chart panel
          ═══════════════════════════════════════════ */}
      <div className="w-[380px] flex-shrink-0 bg-white border-r flex flex-col">
        {/* Header row: title + date picker */}
        <div className="px-5 py-4 border-b flex items-center justify-between gap-3">
          <h2 className="font-bold text-base text-gray-900 flex-shrink-0">
            Reports
          </h2>

          {/* Date picker */}
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 min-w-0 truncate">
                <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{dateRange.label}</span>
                <ChevronDown className="w-3 h-3 flex-shrink-0" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={customDate}
                onSelect={(d) => {
                  if (d) {
                    setCustomDate(d);
                    setDateOpen(false);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* ── MANAGER FILTERS ROW ── */}
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center gap-2">
          {/* Employee filter */}
          <div className="flex-1">
            <Select
              value={selectedEmployeeId}
              onValueChange={setSelectedEmployeeId}
            >
              <SelectTrigger className="h-8 text-xs border-gray-200 bg-white">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Users className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
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
          </div>

          {/* Clear filter chip */}
          {selectedEmployeeId !== "all" && (
            <button
              onClick={() => setSelectedEmployeeId("all")}
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full text-white"
              style={{ backgroundColor: AMBER }}
            >
              {selectedEmployee?.name?.split(" ")[0]}
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={downloading || isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: AMBER }}
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "…" : "CSV"}
          </button>
        </div>

        {/* Period tabs */}
        <div className="flex border-b flex-shrink-0">
          {(["DAY", "WEEK", "MONTH", "YEAR"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "flex-1 py-3 text-xs font-semibold tracking-widest transition-colors border-b-2",
                period === p
                  ? "text-gray-900 border-gray-900"
                  : "text-gray-400 border-transparent hover:text-gray-600",
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Stat cards */}
        <div className="flex gap-3 px-4 py-4 flex-shrink-0">
          <div
            className="flex-1 rounded-xl p-3 text-white flex flex-col items-center min-h-[80px] justify-center"
            style={{ backgroundColor: AMBER }}
          >
            <div className="flex items-center gap-1 mb-1 opacity-80">
              <Phone className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold tracking-wider">
                CALLS
              </span>
            </div>
            <span className="text-3xl font-bold tabular-nums">
              {isLoading ? "—" : stats.calls}
            </span>
          </div>
          <div className="flex-1 border border-gray-200 rounded-xl p-3 flex flex-col items-center min-h-[80px] justify-center">
            <div className="flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider">
                TIME
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-800 tabular-nums">
              {isLoading ? "—" : formatDuration(stats.duration)}
            </span>
          </div>
          <div className="flex-1 border border-gray-200 rounded-xl p-3 flex flex-col items-center min-h-[80px] justify-center">
            <div className="flex items-center gap-1 mb-1">
              <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] font-semibold text-gray-400 tracking-wider">
                SALES
              </span>
            </div>
            <span className="text-2xl font-bold text-gray-800 tabular-nums">
              {isLoading ? "—" : `₹${stats.sales.toLocaleString("en-IN")}`}
            </span>
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex-1 min-h-0 px-3 pb-2">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: AMBER }}
              />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center">
              <BarChart2 className="w-10 h-10 text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No data for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "#fef9ee" }}
                />
                <Bar dataKey="calls" radius={[3, 3, 0, 0]} maxBarSize={36}>
                  {chartData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.calls === maxCalls ? AMBER : AMBER_LIGHT}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t bg-gray-50 text-xs text-gray-500 flex-shrink-0">
          {periodLabel}
          {selectedEmployeeId !== "all" && selectedEmployee && (
            <span className="mx-1">
              ·{" "}
              <span className="font-semibold text-gray-700">
                {selectedEmployee.name}
              </span>
            </span>
          )}
          <span className="ml-1 font-semibold text-gray-700">
            ( {leads.length} Leads )
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MIDDLE — Leads list
          ═══════════════════════════════════════════ */}
      <div
        className={cn(
          "flex flex-col border-r bg-white transition-all duration-200",
          selectedLead ? "w-[550px] flex-shrink-0" : "flex-1",
        )}
      >
        <div className="px-4 py-4 border-b flex items-center justify-between flex-shrink-0">
          <p className="text-sm text-gray-700">
            <span className="font-bold text-gray-900">{leads.length}</span>{" "}
            matching leads
          </p>
          <button
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: AMBER }}
          >
            <BarChart2 className="w-3.5 h-3.5" /> View Chart
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#e5e7eb transparent",
          }}
        >
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: AMBER }}
              />
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-24 text-gray-400">
              <Phone className="w-12 h-12 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-500">
                No calls recorded
              </p>
              <p className="text-xs mt-1">
                {selectedEmployeeId !== "all"
                  ? "This employee has no calls in the selected period"
                  : "Calls this period will appear here"}
              </p>
            </div>
          ) : (
            leads.map((lead: any) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                allOutcomes={allOutcomes}
                selected={selectedLead?.id === lead.id}
                onClick={() =>
                  setSelectedLead((p: any) => (p?.id === lead.id ? null : lead))
                }
              />
            ))
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          RIGHT — Lead detail (read-only for manager)
          ═══════════════════════════════════════════ */}
      {selectedLead && (
        <div
          className="flex-1 min-w-0 bg-white border-l overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <LeadReadOnlyPanel lead={selectedLead} allOutcomes={allOutcomes} />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────
   READ-ONLY LEAD PANEL
   (manager view — no outcome picker / Next button)
───────────────────────── */
function LeadReadOnlyPanel({
  lead,
  allOutcomes,
}: {
  lead: any;
  allOutcomes: any[];
}) {
  const statusStyle = getStatusStyle(lead.status, allOutcomes);
  const metaFields = lead?.meta ? Object.entries(lead.meta) : [];

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["lead-activities-ro", lead.id],
    queryFn: async () => (await api.get(`/leads/${lead.id}/activities`)).data,
    enabled: !!lead.id,
  });

  const formatRel = (date: string) => {
    if (!date) return "";
    const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (d === 0) return "Today";
    if (d === 1) return "1d ago";
    if (d < 30) return `${d}d ago`;
    return `${Math.floor(d / 30)}M ago`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">
              {lead.companyName || lead.personName || "—"}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                style={statusStyle}
              >
                {lead.status || "FRESH"}
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className="w-3.5 h-3.5 text-gray-200 fill-gray-200"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
          {/* Assignee avatar */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-700">
                {lead.assignedTo?.name || "—"}
              </p>
              <p className="text-[10px] text-gray-400">Assigned</p>
            </div>
            <div
              className="w-9 h-9 rounded-full text-white flex items-center justify-center text-sm font-bold"
              style={{ backgroundColor: AMBER }}
            >
              {lead.assignedTo?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        className="flex-1 overflow-y-auto px-6 py-5"
        style={{ scrollbarWidth: "none" }}
      >
        {/* Fields */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-5">
          {[
            { label: "Phone", value: lead.phone, icon: "📞" },
            { label: "Email", value: lead.meta?.email, icon: "✉️" },
            { label: "Person", value: lead.personName, icon: "👤" },
            { label: "Company", value: lead.companyName, icon: "🏢" },
            { label: "Campaign", value: lead.campaign?.name, icon: "📋" },
            {
              label: "Calls",
              value: lead.callCount != null ? `${lead.callCount}×` : "—",
              icon: "📱",
            },
          ].map(({ label, value, icon }) => (
            <div key={label}>
              <p className="text-xs text-gray-400 mb-1">
                {icon} {label}
              </p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {value || "—"}
              </p>
            </div>
          ))}
          {metaFields.map(([key, val]) => (
            <div key={key}>
              <p className="text-xs text-gray-400 mb-1 capitalize">{key}</p>
              <p className="text-sm text-gray-500 truncate">
                {(val as string) || "—"}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-dashed border-gray-200 my-5" />

        {/* Activity */}
        <h3 className="text-sm font-bold text-gray-800 mb-3">
          Activity History
        </h3>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div
              className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: AMBER }}
            />
          </div>
        ) : activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No activity yet
          </p>
        ) : (
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            {activities.map((a: any, i: number) => (
              <div
                key={a.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-3 hover:bg-gray-50",
                  i !== activities.length - 1 && "border-b border-gray-100",
                )}
              >
                <div
                  className="w-6 h-6 rounded-full text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: "#7c3aed" }}
                >
                  {a.user?.name?.slice(0, 2).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    {a.type === "CALL" && (
                      <span>
                        <span className="font-semibold">
                          {a.outcome?.name || "Call"}
                        </span>
                        {a.remark &&
                          ` · ${a.remark.slice(0, 60)}${a.remark.length > 60 ? "…" : ""}`}
                      </span>
                    )}
                    {a.type === "STATUS_CHANGE" && (
                      <span>
                        {a.oldStatus} →{" "}
                        <span className="font-semibold">{a.newStatus}</span>
                      </span>
                    )}
                    {a.type === "ASSIGNED" && (
                      <span>
                        Assigned by{" "}
                        <span className="font-semibold">{a.user?.name}</span>
                      </span>
                    )}
                    {!["CALL", "STATUS_CHANGE", "ASSIGNED"].includes(
                      a.type,
                    ) && <span>{a.remark || a.type}</span>}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {a.user?.name} · {formatRel(a.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
