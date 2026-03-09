"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { api } from "@/lib/api";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  selectedStatuses: string[];
  setSelectedStatuses: (v: string[]) => void;
  selectedCallStats: string[];
  setSelectedCallStats: (v: string[]) => void;
}

const PASTEL = [
  "#93c5fd",
  "#86efac",
  "#fca5a5",
  "#fcd34d",
  "#c4b5fd",
  "#67e8f9",
  "#fdba74",
  "#f9a8d4",
  "#a3e635",
  "#6ee7b7",
];

const CALL_COLORS: Record<string, string> = {
  Attempted: "#6366f1",
  Connected: "#22c55e",
  Pending: "#f59e0b",
  Skipped: "#ef4444",
};

/* ═══════════════════════════════════════
   PIE (top, large) + LEGEND (below)
   ═══════════════════════════════════════ */
function PieWithLegend({
  data,
  selected,
  onToggle,
  valueLabel = (d: any) => `(${d.pct ?? d.value})`,
}: {
  data: { name: string; value: number; pct?: number; color: string }[];
  selected: string[];
  onToggle: (name: string) => void;
  valueLabel?: (d: any) => string;
}) {
  const chartData = data.filter((d) => d.value > 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-gray-800">{d.name}</p>
        <p className="text-gray-500">{d.value} leads</p>
      </div>
    );
  };

  return (
    <div className="flex items-start gap-3">
      {/* ── Pie — left side ── */}
      <div className="flex-shrink-0 w-[200px] h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={88}
              paddingAngle={0}
              onClick={(d) => onToggle(d.name)}
              style={{ cursor: "pointer" }}
              strokeWidth={0}
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  opacity={
                    selected.length === 0 || selected.includes(entry.name)
                      ? 1
                      : 0.3
                  }
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend — right side, scrollable ── */}
      <div
        className="flex-1 min-w-0 overflow-y-auto"
        style={{
          height: 200,
          scrollbarWidth: "thin",
          scrollbarColor: "#e5e7eb transparent",
        }}
      >
        <div className="space-y-0.5 pr-1">
          {data.map((item) => (
            <div
              key={item.name}
              onClick={() => onToggle(item.name)}
              className={`flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors ${
                selected.includes(item.name)
                  ? "bg-indigo-50 border border-indigo-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{
                    backgroundColor: item.color,
                    opacity: item.value === 0 ? 0.3 : 1,
                  }}
                />
                <span className="text-xs text-gray-700 truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {valueLabel(item)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════
   COLLAPSIBLE SECTION
   ══════════════════ */
function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          {open ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>
      {open && children}
    </section>
  );
}

/* ══════════════════════
   MAIN COMPONENT
   ══════════════════════ */
export default function CallerFilterSidebar({
  selectedStatuses,
  setSelectedStatuses,
  selectedCallStats,
  setSelectedCallStats,
}: Props) {
  const [statusOpen, setStatusOpen] = useState(true);
  const [callOpen, setCallOpen] = useState(true);

  const { data: leads = [] } = useQuery({
    queryKey: ["my-leads"],
    queryFn: async () => (await api.get("/leads/my-leads")).data,
  });

  const { data: pipeline } = useQuery({
    queryKey: ["pipeline"],
    queryFn: async () => (await api.get("/pipeline")).data,
  });

  const allStatuses = useMemo(() => {
    const initial = (pipeline?.initialStage || []).map((name: string) => ({
      name,
      color: "#466e62",
    }));
    const active = (pipeline?.activeStage || []).map((s: any, i: number) => ({
      name: s.name,
      color: s.color || PASTEL[(i + 3) % PASTEL.length],
    }));
    const closed = (pipeline?.closedStage || []).map((s: any, i: number) => ({
      name: s.name,
      color: s.color || PASTEL[(i + 6) % PASTEL.length],
    }));
    return [...initial, ...active, ...closed];
  }, [pipeline]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l: any) => {
      counts[l.status] = (counts[l.status] || 0) + 1;
    });
    const total = leads.length || 1;
    return allStatuses.map((s) => ({
      name: s.name,
      value: counts[s.name] || 0,
      pct: Math.round(((counts[s.name] || 0) / total) * 100),
      color: s.color,
    }));
  }, [leads, allStatuses]);

  const callData = useMemo(() => {
    let attempted = 0,
      connected = 0,
      pending = 0,
      skipped = 0;
    const notConnected = ["RNR", "Busy", "Switched Off", "Not Picked Up"];
    const isConnected = [
      "Interested",
      "Connected",
      "Callback Scheduled",
      "Call Later",
    ];
    leads.forEach((l: any) => {
      if (l.calledToday) {
        attempted++;
        if (notConnected.includes(l.status)) skipped++;
        else if (isConnected.includes(l.status)) connected++;
        else pending++;
      } else {
        pending++;
      }
    });
    const total = leads.length || 1;
    return [
      {
        name: "Attempted",
        value: attempted,
        pct: Math.round((attempted / total) * 100),
        color: CALL_COLORS.Attempted,
      },
      {
        name: "Connected",
        value: connected,
        pct: Math.round((connected / total) * 100),
        color: CALL_COLORS.Connected,
      },
      {
        name: "Pending",
        value: pending,
        pct: Math.round((pending / total) * 100),
        color: CALL_COLORS.Pending,
      },
      {
        name: "Skipped",
        value: skipped,
        pct: Math.round((skipped / total) * 100),
        color: CALL_COLORS.Skipped,
      },
    ];
  }, [leads]);

  const totalFilters = selectedStatuses.length + selectedCallStats.length;

  const toggleStatus = (name: string) =>
    setSelectedStatuses(
      selectedStatuses.includes(name)
        ? selectedStatuses.filter((s) => s !== name)
        : [...selectedStatuses, name],
    );

  const toggleCall = (name: string) =>
    setSelectedCallStats(
      selectedCallStats.includes(name)
        ? selectedCallStats.filter((s) => s !== name)
        : [...selectedCallStats, name],
    );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* HEADER */}
      <div className="px-5 py-4 border-b flex items-center justify-between flex-shrink-0">
        <h2 className="font-bold text-base text-gray-900">My Overview</h2>
        {totalFilters > 0 && (
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-100 text-indigo-700 border-0 text-xs">
              {totalFilters} filter{totalFilters > 1 ? "s" : ""}
            </Badge>
            <button
              onClick={() => {
                setSelectedStatuses([]);
                setSelectedCallStats([]);
              }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* BODY */}
      <div
        className="flex-1 overflow-y-auto px-5 py-5 space-y-6"
        style={
          {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          } as React.CSSProperties
        }
      >
        <Section
          title="Leads Status Report"
          open={statusOpen}
          onToggle={() => setStatusOpen((v) => !v)}
        >
          {statusData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6 bg-gray-50 rounded-lg">
              No leads assigned yet
            </p>
          ) : (
            <PieWithLegend
              data={statusData}
              selected={selectedStatuses}
              onToggle={toggleStatus}
              valueLabel={(d) => `(${d.pct}%)`}
            />
          )}
        </Section>

        <div className="border-t border-gray-100" />

        <Section
          title="Campaign Calling Report"
          open={callOpen}
          onToggle={() => setCallOpen((v) => !v)}
        >
          <PieWithLegend
            data={callData}
            selected={selectedCallStats}
            onToggle={toggleCall}
            valueLabel={(d) => `(${d.pct}%)`}
          />
        </Section>
      </div>
    </div>
  );
}
