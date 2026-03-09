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
  for (let i = 0; i < seed.length; i++)
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return PASTEL_COLORS[Math.abs(hash) % PASTEL_COLORS.length];
};

const generateRandomColor = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 65%, 55%)`;
};

const getDaysAgo = (dateStr?: string): number => {
  if (!dateStr) return 0;
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  );
};

/* ================= DEMO DATA ================= */

const DEMO_DEO_DATA = [
  { id: "deo-1", name: "Attempted", value: 20, color: "#d1b528" },
  { id: "deo-2", name: "Connected", value: 12, color: "#93cfad" },
  { id: "deo-3", name: "Pending", value: 65, color: "#f54747" },
  { id: "deo-4", name: "Skipped", value: 1, color: "#ab5b50" },
];
const DEMO_DEO_TOTAL = DEMO_DEO_DATA.reduce((sum, d) => sum + d.value, 0);

/* ================= SIZING CONSTANTS ================= */
// Change these two values to resize all charts uniformly
const PIE_SIZE = 200; // container width & height in px
const OUTER_R = 88; // Recharts outerRadius

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

/* ================= CHART SECTION ================= */

function ChartSection({
  data,
  selected,
  onClickItem,
  total,
}: {
  data: { id: string; name: string; value: number; color: string }[];
  selected: string[];
  onClickItem: (id: string) => void;
  total: number;
}) {
  const pieData = data.map((d) => ({
    ...d,
    _display: d.value === 0 ? 0.3 : d.value,
  }));

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
      {/* ── Pie — left ── */}
      <div
        className="flex-shrink-0"
        style={{ width: PIE_SIZE, height: PIE_SIZE }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="_display"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={OUTER_R}
              paddingAngle={0}
              strokeWidth={0}
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
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend — right, scrollable, same height as pie ── */}
      <ScrollArea className="flex-1" style={{ height: PIE_SIZE }}>
        <div className="space-y-0.5 pr-2">
          {data.map((item) => (
            <div
              key={item.id}
              onClick={() => onClickItem(item.id)}
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors text-xs ${
                selected.includes(item.id) ? "bg-indigo-50" : "hover:bg-gray-50"
              }`}
            >
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{
                  backgroundColor: item.color,
                  opacity: item.value === 0 ? 0.3 : 1,
                }}
              />
              <span className="flex-1 truncate font-medium text-gray-700">
                {item.name}
              </span>
              <span className="text-gray-400 whitespace-nowrap">
                ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

/* ================= COLLAPSIBLE SECTION ================= */

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
  const [expanded, setExpanded] = React.useState({
    status: true,
    employee: true,
    deo: true,
  });
  const [selectedDeos, setSelectedDeos] = React.useState<string[]>([]);

  const toggle = (k: keyof typeof expanded) =>
    setExpanded((prev) => ({ ...prev, [k]: !prev[k] }));

  /* ── Pipeline statuses ── */
  const allStatuses = [
    ...(pipeline?.initialStage ?? []).map((name: string) => ({
      name,
      color: "#466e62",
    })),
    ...(pipeline?.activeStage ?? []).map((s: any) => ({
      name: s.name,
      color: s.color || generateRandomColor(s.name),
    })),
    ...(pipeline?.closedStage ?? []).map((s: any) => ({
      name: s.name,
      color: s.color || generateRandomColor(s.name),
    })),
  ];

  const statusCounts: Record<string, number> = {};
  leads.forEach((lead) => {
    statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    if (!allStatuses.find((s) => s.name === lead.status))
      allStatuses.push({ name: lead.status, color: "#466e62" });
  });

  const statusData = allStatuses.map((s) => ({
    id: s.name,
    name: s.name,
    value: statusCounts[s.name] || 0,
    color: s.color,
  }));

  /* ── Employee data ── */
  const empCounts: Record<
    string,
    { name: string; count: number; color: string }
  > = {};
  leads.forEach((lead: any) => {
    const id = lead.assignedToId || lead.assignedTo?.id;
    const name = lead.assignedTo?.name;
    if (id) {
      if (!empCounts[id])
        empCounts[id] = {
          name: name || "Unknown",
          count: 0,
          color: getEmployeeColor(id),
        };
      empCounts[id].count++;
    }
  });
  const employeeData = Object.entries(empCounts).map(([id, d]) => ({
    id,
    name: d.name,
    value: d.count,
    color: d.color,
  }));

  /* ── Handlers ── */
  const handleStatus = (id: string) => {
    const s = id as LeadStatus;
    setSelectedStatuses(
      selectedStatuses.includes(s)
        ? selectedStatuses.filter((x) => x !== s)
        : [...selectedStatuses, s],
    );
  };
  const handleEmployee = (id: string) =>
    setSelectedEmployees(
      selectedEmployees.includes(id)
        ? selectedEmployees.filter((x) => x !== id)
        : [...selectedEmployees, id],
    );
  const handleDeo = (id: string) =>
    setSelectedDeos(
      selectedDeos.includes(id)
        ? selectedDeos.filter((x) => x !== id)
        : [...selectedDeos, id],
    );

  return (
    <div className="w-[480px] bg-white border-r flex flex-col h-full">
      <CampaignHeader info={campaignInfo} />

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Campaign Assignees */}
        {employeeData.length > 0 && (
          <>
            <Section
              title="Campaign Assignees Report"
              open={expanded.employee}
              onToggle={() => toggle("employee")}
            >
              <ChartSection
                data={employeeData}
                selected={selectedEmployees}
                onClickItem={handleEmployee}
                total={leads.length}
              />
            </Section>
            <div className="border-t" />
          </>
        )}

        {/* Calling Report */}
        <Section
          title="Campaign Calling Report"
          open={expanded.deo}
          onToggle={() => toggle("deo")}
        >
          <ChartSection
            data={DEMO_DEO_DATA}
            selected={selectedDeos}
            onClickItem={handleDeo}
            total={DEMO_DEO_TOTAL}
          />
        </Section>

        {/* Status Report */}
        {statusData.length > 0 && (
          <>
            <div className="border-t" />
            <Section
              title="Leads Status Report"
              open={expanded.status}
              onToggle={() => toggle("status")}
            >
              <ChartSection
                data={statusData}
                selected={selectedStatuses}
                onClickItem={handleStatus}
                total={leads.length}
              />
            </Section>
          </>
        )}

        {statusData.length === 0 && employeeData.length === 0 && (
          <p className="text-center text-sm text-gray-400 py-8">
            No leads in this campaign yet
          </p>
        )}
      </div>
    </div>
  );
}
