import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Lead, LeadStatus } from "@/types/leads.types";
import {
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  TrendingUp,
  EllipsisVertical,
} from "lucide-react";

/* ================= HELPERS ================= */

const PASTEL_COLORS = [
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

const getEmployeeColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];
};

const generateRandomColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
};

const getDaysAgo = (dateStr?: string): number => {
  if (!dateStr) return 0;
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
};

/* ================= DEMO DEO DATA ================= */

const DEMO_DEO_DATA = [
  { id: "deo-1", name: "Attempted ", value: 20, color: "#d1b528" },
  { id: "deo-2", name: "Connected", value: 12, color: "#93cfad" },
  { id: "deo-3", name: "Pending", value: 65, color: "#f54747" },
  { id: "deo-4", name: "Skipped ", value: 1, color: "#ab5b50" },
];
const DEMO_DEO_TOTAL = DEMO_DEO_DATA.reduce((sum, d) => sum + d.value, 0);

/* ================= TYPES ================= */

interface PipelineStage {
  id: string;
  name: string;
  color?: string;
  stage: string;
}

interface CampaignInfo {
  name: string;
  total: number;
  completed: number;
  assignedEmployees: { id: string; name: string }[];
  createdAt?: string;
}

interface Props {
  leads: Lead[];
  campaignInfo?: CampaignInfo | null;
  pipeline?: {
    initialStage?: string[];
    activeStage?: PipelineStage[];
    closedStage?: PipelineStage[];
  };
  selectedStatuses: LeadStatus[];
  selectedEmployees: string[];
  setSelectedStatuses: (v: LeadStatus[]) => void;
  setSelectedEmployees: (v: string[]) => void;
}

/* ================= CAMPAIGN HEADER ================= */

function CampaignHeader({ info }: { info?: CampaignInfo | null }) {
  if (!info) {
    return (
      <div className="p-4 border-b animate-pulse space-y-3">
        <div className="h-5 bg-gray-200 rounded w-2/3" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-10 bg-gray-100 rounded w-full" />
      </div>
    );
  }

  const days = getDaysAgo(info.createdAt);
  const progress =
    info.total > 0 ? Math.round((info.completed / info.total) * 100) : 0;

  return (
    <div className="p-4 border-b bg-white">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-base text-gray-600 truncate mb-3">
          @{info.name}
        </h2>
        <EllipsisVertical className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {days}d
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              {info.total.toLocaleString()} leads
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {info.assignedEmployees.length}
            </span>
          </div>

          {info.assignedEmployees.length > 0 && (
            <div className="flex items-center gap-1 mb-1">
              {info.assignedEmployees.slice(0, 5).map((emp) => (
                <div
                  key={emp.id}
                  title={emp.name}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-gray-700 text-[10px] font-bold ring-2 ring-white flex-shrink-0"
                  style={{ backgroundColor: getEmployeeColor(emp.id) }}
                >
                  {emp.name.slice(0, 2).toUpperCase()}
                </div>
              ))}
              {info.assignedEmployees.length > 5 && (
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-[10px] font-bold ring-2 ring-white">
                  +{info.assignedEmployees.length - 5}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative w-14 h-14 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#7c3aed"
              strokeWidth="3"
              strokeDasharray={`${progress * 0.942} 94.2`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */

export default function FiltersSidebar({
  leads,
  campaignInfo,
  pipeline,
  selectedStatuses,
  selectedEmployees,
  setSelectedStatuses,
  setSelectedEmployees,
}: Props) {
  const [expandedSections, setExpandedSections] = React.useState({
    status: true,
    employee: true,
    deo: true,
  });

  const [selectedDeos, setSelectedDeos] = React.useState<string[]>([]);

  const toggleSection = (section: keyof typeof expandedSections) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  /* ================= COMPUTED DATA ================= */

  const allPipelineStatuses = [
    ...(pipeline?.initialStage ?? []).map((name: string) => ({
      name,
      // ← FIX: use pipeline color via generateRandomColor, not hardcoded "#466e62"
      color: "#466e62",
      stage: "INITIAL",
    })),
    ...(pipeline?.activeStage ?? []).map((s: any) => ({
      name: s.name,
      color: s.color || generateRandomColor(s.name),
      stage: "ACTIVE",
    })),
    ...(pipeline?.closedStage ?? []).map((s: any) => ({
      name: s.name,
      color: s.color || generateRandomColor(s.name),
      stage: "CLOSED",
    })),
  ];

  const statusCounts: Record<string, number> = {};
  leads.forEach((lead) => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
  });

  // Add statuses found in leads but not in pipeline config
  leads.forEach((lead) => {
    const knownNames = allPipelineStatuses.map((s) => s.name);
    if (!knownNames.includes(lead.status)) {
      allPipelineStatuses.push({
        name: lead.status,
        color: "#466e62",
        stage: "INITIAL",
      });
    }
  });

  // ← FIX: removed .filter((s) => s.value > 0)
  // ALL pipeline statuses now show even if count is 0
  const statusData = allPipelineStatuses.map((s) => ({
    id: s.name,
    name: s.name,
    value: statusCounts[s.name] || 0,
    color: s.color,
  }));

  const employeeCounts: Record<
    string,
    { name: string; count: number; color: string }
  > = {};
  leads.forEach((lead: any) => {
    const empId = lead.assignedToId || lead.assignedTo?.id;
    const empName = lead.assignedTo?.name;
    if (empId) {
      if (!employeeCounts[empId]) {
        employeeCounts[empId] = {
          name: empName || "Unknown",
          count: 0,
          color: getEmployeeColor(empId),
        };
      }
      employeeCounts[empId].count++;
    }
  });

  const employeeData = Object.entries(employeeCounts).map(([id, d]) => ({
    id,
    name: d.name,
    value: d.count,
    color: d.color,
  }));

  /* ================= HANDLERS ================= */

  const handleStatusClick = (id: string) => {
    const status = id as LeadStatus;
    setSelectedStatuses(
      selectedStatuses.includes(status)
        ? selectedStatuses.filter((s) => s !== status)
        : [...selectedStatuses, status],
    );
  };

  const handleEmployeeClick = (id: string) =>
    setSelectedEmployees(
      selectedEmployees.includes(id)
        ? selectedEmployees.filter((e) => e !== id)
        : [...selectedEmployees, id],
    );

  const handleDeoClick = (id: string) =>
    setSelectedDeos(
      selectedDeos.includes(id)
        ? selectedDeos.filter((d) => d !== id)
        : [...selectedDeos, id],
    );

  /* ================= CHART + LEGEND ================= */

  const renderChartSection = (
    data: { id: string; name: string; value: number; color: string }[],
    selected: string[],
    onClickItem: (id: string) => void,
    totalOverride?: number,
  ) => {
    const total = totalOverride ?? leads.length;

    // Give 0-value items a tiny slice so they appear in the pie
    const pieData = data.map((d) => ({
      ...d,
      _display: d.value === 0 ? 0.3 : d.value,
    }));

    return (
      <div className="flex gap-3">
        <div
          className="flex-shrink-0"
          style={{ width: "160px", height: "160px" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="_display"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={75}
                onClick={(_, index) => onClickItem(data[index].id)}
                style={{ cursor: "pointer" }}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.id}
                    fill={entry.color}
                    opacity={
                      selected.length === 0 || selected.includes(entry.id)
                        ? entry.value > 0
                          ? 1
                          : 0.15
                        : 0.3
                    }
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any, props: any) =>
                  // Show real value in tooltip, not _display
                  [props.payload.value, name]
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ScrollArea className="flex-1" style={{ height: "160px" }}>
          <div className="space-y-1 pr-2">
            {data.map((item) => (
              <div
                key={item.id}
                onClick={() => onClickItem(item.id)}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors text-xs ${
                  selected.includes(item.id)
                    ? "bg-indigo-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div
                  className="w-4 h-3 flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 truncate font-medium">{item.name}</span>
                <span className="text-gray-500 font-semibold whitespace-nowrap">
                  <span className="text-gray-400">
                    ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                  </span>
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  /* ================= RENDER ================= */

  return (
    <div className="w-[430px] bg-white border-r flex flex-col h-full">
      <CampaignHeader info={campaignInfo} />

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* ASSIGNED TO */}
        {employeeData.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">
                Campaign Assignees Report
              </h3>
              <button
                onClick={() => toggleSection("employee")}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.employee ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
            {expandedSections.employee &&
              renderChartSection(
                employeeData,
                selectedEmployees,
                handleEmployeeClick,
              )}
          </section>
        )}

        {employeeData.length > 0 && <div className="border-t" />}

        {/* DEO — demo data */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Campaign Calling Report</h3>
            </div>
            <button
              onClick={() => toggleSection("deo")}
              className="text-gray-400 hover:text-gray-600"
            >
              {expandedSections.deo ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
          {expandedSections.deo &&
            renderChartSection(
              DEMO_DEO_DATA,
              selectedDeos,
              handleDeoClick,
              DEMO_DEO_TOTAL,
            )}
        </section>

        {/* STATUS */}
        {statusData.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Leads Status Report</h3>
              <button
                onClick={() => toggleSection("status")}
                className="text-gray-400 hover:text-gray-600"
              >
                {expandedSections.status ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
            {expandedSections.status &&
              renderChartSection(
                statusData,
                selectedStatuses,
                handleStatusClick,
              )}
          </section>
        )}

        {statusData.length > 0 && <div className="border-t" />}

        {statusData.length === 0 && employeeData.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-8">
            No leads in this campaign yet
          </div>
        )}
      </div>
    </div>
  );
}
