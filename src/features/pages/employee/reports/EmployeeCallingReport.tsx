"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  PhoneCall,
  MessageSquare,
  FileText,
  Building2,
  User,
  AtSign,
  Flag,
  MoreVertical,
  Copy,
  UserCheck,
  FileCheck,
  CheckCircle2,
  ChevronRight,
  Filter,
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
const copyToClipboard = (text: string) => {
  if (!text) return;
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success("Copied"))
    .catch(() => toast.error("Failed to copy"));
};

const formatDuration = (s: number) => {
  if (!s) return "0s";
  const h = Math.floor(s / 3600),
    m = Math.floor((s % 3600) / 60),
    sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
};

const formatRelativeTime = (date: string) => {
  if (!date) return "";
  const d = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  if (d === 0) return "Today";
  if (d === 1) return "1d ago";
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}M ago`;
};

const normalizeStages = (stage: any[] = []) =>
  stage.map((o: any) =>
    typeof o === "string"
      ? { id: o, name: o, color: "#94a3b8", reasons: [] }
      : o,
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
   ACTIVITY ROW
───────────────────────── */
function ActivityRow({ activity, index, total }: any) {
  const [open, setOpen] = useState(false);
  const remark = activity.remark;
  const isLong = remark && remark.length > 60 && activity.type === "CALL";

  const TypeIcon = () => {
    switch (activity.type) {
      case "CALL":
        return (
          <PhoneCall className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
        );
      case "STATUS_CHANGE":
        return (
          <div className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 flex-shrink-0" />
        );
      case "ASSIGNED":
        return (
          <UserCheck className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        );
      case "NOTE":
        return (
          <FileText className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
        );
      case "SOURCE":
        return <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />;
    }
  };

  const Text = () => {
    switch (activity.type) {
      case "STATUS_CHANGE":
        return (
          <span className="text-sm text-gray-600">
            Status changed from{" "}
            <b className="text-gray-800">{activity.oldStatus || "—"}</b>
            {" → "}
            <b className="text-gray-800">{activity.newStatus || "—"}</b>
          </span>
        );
      case "CALL":
        return (
          <span className="flex items-baseline gap-1.5 flex-wrap">
            {activity.duration && (
              <span className="text-sm font-mono text-gray-900">
                {activity.duration}
              </span>
            )}
            <span className="text-sm text-gray-900">
              {activity.outcome?.name || "Call Made"}
            </span>
            {remark && !isLong && (
              <span className="text-sm text-gray-500">{remark}</span>
            )}
            {remark && isLong && !open && (
              <span className="text-sm text-gray-500 truncate max-w-[180px]">
                {remark.slice(0, 55)}…
              </span>
            )}
            {remark && isLong && open && (
              <span className="text-sm text-gray-500">{remark}</span>
            )}
          </span>
        );
      case "ASSIGNED":
        return (
          <span className="text-sm text-gray-600">
            Lead assigned by{" "}
            <b className="text-gray-800">{activity.user?.name || "—"}</b>
            {activity.assignee?.name && (
              <>
                {" → "}
                <b className="text-gray-800">{activity.assignee.name}</b>
              </>
            )}
          </span>
        );
      case "REMARK":
      case "NOTE":
        return <span className="text-sm text-gray-600">{remark || "—"}</span>;
      case "SOURCE":
        return (
          <span className="text-sm text-gray-600">
            Lead Source:{" "}
            <b className="text-gray-800">{activity.source || remark || "—"}</b>
          </span>
        );
      default:
        return (
          <span className="text-sm text-gray-600">
            {remark || activity.type}
          </span>
        );
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors",
        index !== total - 1 && "border-b border-gray-100",
        isLong && "cursor-pointer",
      )}
      onClick={() => isLong && setOpen((v) => !v)}
    >
      <Star className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
      <TypeIcon />
      <div className="flex-1 min-w-0">
        <Text />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {formatRelativeTime(activity.createdAt)}
        </span>
        {activity.user?.name && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
            style={{ backgroundColor: "#7c3aed" }}
            title={activity.user.name}
          >
            {activity.user.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        {isLong && (
          <ChevronDown
            className={cn(
              "w-3 h-3 text-gray-400 transition-transform",
              open && "rotate-180",
            )}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────
   OUTCOME BUTTON
───────────────────────── */
function OutcomeButton({
  outcome,
  outcomeId,
  setOutcomeId,
  setUiStatus,
  onSelect,
}: any) {
  const sel = outcomeId === outcome.id;
  return (
    <button
      onClick={() => {
        setOutcomeId(outcome.id);
        setUiStatus(outcome.name);
        onSelect?.();
      }}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between",
        sel ? "shadow-sm" : "hover:bg-gray-50",
      )}
      style={{
        backgroundColor: sel ? outcome.color + "15" : "transparent",
        color: sel ? outcome.color : "#374151",
        border: sel ? `1px solid ${outcome.color}40` : "1px solid transparent",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: outcome.color }}
        />
        <span className="font-medium">{outcome.name}</span>
      </div>
      {sel && (
        <CheckCircle2 className="h-4 w-4" style={{ color: outcome.color }} />
      )}
    </button>
  );
}

/* ─────────────────────────
   LEAD DETAIL PANEL
   (matches screenshot exactly)
───────────────────────── */
function LeadDetailPanel({
  lead,
  allOutcomes,
  initialStages,
  activeStages,
  closedStages,
}: {
  lead: any;
  allOutcomes: any[];
  initialStages: any[];
  activeStages: any[];
  closedStages: any[];
}) {
  const queryClient = useQueryClient();
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [uiStatus, setUiStatus] = useState<string>(lead?.status || "");
  const [outcomeId, setOutcomeId] = useState<string | null>(null);
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  // Reset when lead changes
  React.useEffect(() => {
    setUiStatus(lead?.status || "");
    setOutcomeId(null);
    setReasonId(null);
    setRemark("");
    setFormValues({});
  }, [lead?.id]);

  React.useEffect(() => {
    setReasonId(null);
  }, [outcomeId]);

  const { data: activities = [], isLoading: actsLoading } = useQuery({
    queryKey: ["lead-activities", lead?.id],
    queryFn: async () => (await api.get(`/leads/${lead.id}/activities`)).data,
    enabled: !!lead?.id,
  });

  const { data: form } = useQuery({
    queryKey: ["active-form"],
    queryFn: async () => (await api.get("/forms/active")).data,
  });

  const completeMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post("/leads/complete", data);
    },
    onSuccess: () => {
      toast.success("Lead updated");
      queryClient.invalidateQueries({
        queryKey: ["lead-activities", lead?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["employee-calling-report"] });
      setOutcomeId(null);
      setReasonId(null);
      setRemark("");
      setFormValues({});
    },
    onError: () => toast.error("Failed to update"),
  });

  const handleNext = async () => {
    if (!outcomeId) {
      toast.error("Select an outcome first");
      return;
    }
    await completeMutation.mutateAsync({
      leadId: lead.id,
      outcomeId,
      outcomeReasonId: reasonId || undefined,
      remark: remark || undefined,
      formValues: Object.keys(formValues).length ? formValues : undefined,
    });
  };

  const selectedOutcome = allOutcomes.find((o: any) => o.id === outcomeId);
  const statusStyle = getStatusStyle(uiStatus || lead?.status, allOutcomes);
  const metaFields = lead?.meta ? Object.entries(lead.meta) : [];

  return (
    <div className="flex-1 bg-white flex flex-col overflow-hidden border-l">
      {/* ── HEADER — matches screenshot top bar ── */}
      <div className="flex-shrink-0 px-6 py-4 border-b bg-white">
        <div className="flex items-center justify-between gap-3">
          {/* Left: company name + badge + stars */}
          <div className="flex-1 min-w-0">
            {/* Row 1: name + assignee avatar + icons + Next */}
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-base font-bold text-gray-900 truncate flex-1">
                {lead?.companyName || lead?.personName || "—"}
              </h1>

              {/* Assignee avatar */}
              <div
                className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: AMBER }}
              >
                {lead?.assignedTo?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              {/* Icons */}
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <AtSign className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <Flag className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-100 rounded-full">
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>

              {/* Next */}
              <button
                onClick={handleNext}
                disabled={!outcomeId || completeMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                style={{ backgroundColor: AMBER }}
              >
                {completeMutation.isPending ? "…" : "Next"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Row 2: outcome badge + chevron + stars */}
            <div className="flex items-center gap-2">
              <Popover open={outcomeOpen} onOpenChange={setOutcomeOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1 group">
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer"
                      style={statusStyle}
                    >
                      {uiStatus || lead?.status || "FRESH"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" align="start">
                  <ScrollArea className="h-[50vh] max-h-[360px]">
                    <div className="space-y-3 pr-2">
                      {initialStages.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1">
                            Initial
                          </p>
                          {initialStages.map((o: any) => (
                            <OutcomeButton
                              key={o.id}
                              outcome={o}
                              outcomeId={outcomeId}
                              setOutcomeId={setOutcomeId}
                              setUiStatus={setUiStatus}
                              onSelect={() => setOutcomeOpen(false)}
                            />
                          ))}
                        </div>
                      )}
                      {activeStages.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1">
                            Active
                          </p>
                          {activeStages.map((o: any) => (
                            <OutcomeButton
                              key={o.id || o.name}
                              outcome={o}
                              outcomeId={outcomeId}
                              setOutcomeId={setOutcomeId}
                              setUiStatus={setUiStatus}
                              onSelect={() => setOutcomeOpen(false)}
                            />
                          ))}
                        </div>
                      )}
                      {closedStages.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1">
                            Closed
                          </p>
                          {closedStages.map((o: any) => (
                            <OutcomeButton
                              key={o.id || o.name}
                              outcome={o}
                              outcomeId={outcomeId}
                              setOutcomeId={setOutcomeId}
                              setUiStatus={setUiStatus}
                              onSelect={() => setOutcomeOpen(false)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              {/* Stars */}
              <div className="flex gap-0.5 ml-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-3.5 h-3.5 text-gray-300 fill-gray-200"
                  />
                ))}
              </div>
            </div>

            {/* Reason pills */}
            {selectedOutcome?.reasons?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedOutcome.reasons.map((r: any) => (
                  <Badge
                    key={r.id}
                    className={cn(
                      "cursor-pointer text-xs px-2.5 py-1 border-0 transition-all",
                      reasonId === r.id
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                    )}
                    onClick={() =>
                      setReasonId((p) => (p === r.id ? null : r.id))
                    }
                  >
                    {r.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div
        className="flex-1 overflow-y-auto px-6 py-5"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#e5e7eb transparent",
        }}
      >
        {/* Fields — 2 column grid matching screenshot */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 mb-2">
          {/* Phone */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Phone className="w-3 h-3" />
              <span>Phone</span>
              <button
                onClick={() => copyToClipboard(lead?.phone || "")}
                className="hover:text-indigo-500 ml-0.5"
              >
                <Copy className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-medium">IN</span>
              <span className="text-sm font-bold text-gray-900">
                {lead?.phone || "—"}
              </span>
            </div>
          </div>

          {/* Email */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <AtSign className="w-3 h-3" />
              <span>Email</span>
            </div>
            <p className="text-sm text-gray-400">
              {lead?.meta?.email || "Empty"}
            </p>
          </div>

          {/* Person Name */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <User className="w-3 h-3" />
              <span>Person Name</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {lead?.personName || "—"}
            </p>
          </div>

          {/* Company */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <Building2 className="w-3 h-3" />
              <span>Company</span>
            </div>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {lead?.companyName || "—"}
            </p>
          </div>

          {/* Status */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <FileText className="w-3 h-3" />
              <span>Status</span>
            </div>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full border inline-block"
              style={getStatusStyle(lead?.status, allOutcomes)}
            >
              {lead?.status || "FRESH"}
            </span>
          </div>

          {/* Assigned To */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <User className="w-3 h-3" />
              <span>Assigned To</span>
            </div>
            <p className="text-sm font-bold text-gray-900">
              {lead?.assignedTo?.name || "—"}
            </p>
          </div>

          {/* Campaign */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <FileText className="w-3 h-3" />
              <span>Campaign</span>
            </div>
            <p className="text-sm font-semibold text-indigo-600">
              {lead?.campaign?.name || "—"}
            </p>
          </div>

          {/* Meta fields */}
          {metaFields.map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <FileText className="w-3 h-3" />
                <span className="capitalize">{key}</span>
              </div>
              <p className="text-sm text-gray-500">
                {(value as string) || "—"}
              </p>
            </div>
          ))}
        </div>

        {/* Show more */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 border-t border-dashed border-gray-200" />
          <button className="text-xs text-gray-400 hover:text-gray-600">
            Show more
          </button>
          <div className="flex-1 border-t border-dashed border-gray-200" />
        </div>

        {/* Action buttons — matches screenshot icons */}
        <div className="grid grid-cols-5 gap-2 mb-5">
          {[
            { icon: <PhoneCall className="w-5 h-5" />, label: "CALL" },
            { icon: <Clock className="w-5 h-5" />, label: "CALL LATER" },
            { icon: <MessageSquare className="w-5 h-5" />, label: "WHATSAPP" },
            { icon: <MessageSquare className="w-5 h-5" />, label: "SMS" },
            { icon: <FileText className="w-5 h-5" />, label: "ADD NOTE" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-1.5 py-3 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors"
            >
              {icon}
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>

        <Separator className="mb-4" />

        {/* Tabs — Activity History | Remark | Form */}
        <Tabs defaultValue="activity">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-transparent p-0 h-auto border-b border-gray-200 gap-0 rounded-none">
              {[
                { value: "activity", label: "Activity History" },
                { value: "remark", label: "Remark" },
                { value: "form", label: "Form" },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-4 py-2 text-sm text-gray-500 whitespace-nowrap"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <button
              className="text-sm px-3 py-1.5 rounded-lg border font-medium transition-colors hover:bg-amber-50"
              style={{ color: AMBER, borderColor: AMBER + "60" }}
            >
              + Action
            </button>
          </div>

          {/* Activity */}
          <TabsContent value="activity" className="mt-0">
            <div className="flex gap-2 mb-4">
              {[
                { icon: <Filter className="w-3 h-3" />, label: "All Actions" },
                { icon: <Clock className="w-3 h-3" />, label: "Time" },
                { icon: <User className="w-3 h-3" />, label: "Team" },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs text-gray-600 hover:bg-gray-50"
                >
                  {icon}
                  {label}
                  <ChevronDown className="w-3 h-3 ml-0.5" />
                </button>
              ))}
            </div>
            {actsLoading ? (
              <div className="flex justify-center py-10">
                <div
                  className="animate-spin rounded-full h-6 w-6 border-b-2"
                  style={{ borderColor: AMBER }}
                />
              </div>
            ) : activities?.length > 0 ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {activities.map((a: any, i: number) => (
                  <ActivityRow
                    key={a.id}
                    activity={a}
                    index={i}
                    total={activities.length}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No activity yet</p>
              </div>
            )}
          </TabsContent>

          {/* Remark */}
          <TabsContent value="remark" className="mt-0">
            <div className="p-4 rounded-xl border border-gray-200">
              <label className="text-sm font-semibold text-gray-900 mb-2 block">
                Call Remark
              </label>
              <Textarea
                placeholder="Write notes…"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={7}
                className="resize-none text-sm"
              />
            </div>
          </TabsContent>

          {/* Form */}
          <TabsContent value="form" className="mt-0">
            {!form?.schema?.length ? (
              <div className="text-center py-10 text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No form configured</p>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-gray-200 space-y-4">
                <p className="text-sm font-bold text-gray-900">{form.name}</p>
                <div className="grid grid-cols-2 gap-3">
                  {form.schema.map((field: any) => (
                    <div key={field.id}>
                      <label className="text-xs font-semibold text-gray-700 mb-1 block">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      {field.type === "text" && (
                        <Input
                          value={formValues[field.id] || ""}
                          onChange={(e) =>
                            setFormValues({
                              ...formValues,
                              [field.id]: e.target.value,
                            })
                          }
                          className="text-sm h-8"
                        />
                      )}
                      {field.type === "number" && (
                        <Input
                          type="number"
                          value={formValues[field.id] || ""}
                          onChange={(e) =>
                            setFormValues({
                              ...formValues,
                              [field.id]: e.target.value,
                            })
                          }
                          className="text-sm h-8"
                        />
                      )}
                      {field.type === "textarea" && (
                        <Textarea
                          value={formValues[field.id] || ""}
                          onChange={(e) =>
                            setFormValues({
                              ...formValues,
                              [field.id]: e.target.value,
                            })
                          }
                          rows={2}
                          className="text-sm resize-none"
                        />
                      )}
                      {field.type === "select" && (
                        <Select
                          value={formValues[field.id]}
                          onValueChange={(v) =>
                            setFormValues({ ...formValues, [field.id]: v })
                          }
                        >
                          <SelectTrigger className="text-sm h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((o: string) => (
                              <SelectItem key={o} value={o}>
                                {o}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ─────────────────────────
   LEAD CARD (middle column)
───────────────────────── */
function LeadCard({
  lead,
  allOutcomes,
  selected,
  onClick,
}: {
  lead: any;
  allOutcomes: any[];
  selected: boolean;
  onClick: () => void;
}) {
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
export default function EmployeeCallingReport() {
  const [period, setPeriod] = useState<Period>("DAY");
  const [customDate, setCustomDate] = useState<Date>(new Date());
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);

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

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["employee-calling-report", period, dateRange.from.toISOString()],
    queryFn: async () =>
      (
        await api.get("/reports/my-calls", {
          params: {
            from: dateRange.from.toISOString(),
            to: dateRange.to.toISOString(),
            period,
          },
        })
      ).data,
  });

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

  const periodLabel = {
    DAY: format(customDate, "dd MMM") + " Calls Reports",
    WEEK: "This Week Calls Reports",
    MONTH: format(customDate, "MMMM") + " Calls Reports",
    YEAR: format(customDate, "yyyy") + " Calls Reports",
  }[period];

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* ═══════ LEFT — Reports panel ═══════ */}
      <div className="w-[380px] flex-shrink-0 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-base text-gray-900">Reports</h2>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50">
                <CalendarIcon className="w-3.5 h-3.5" />
                {dateRange.label}
                <ChevronDown className="w-3 h-3" />
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

        {/* Period tabs — underline style matching screenshot */}
        <div className="flex border-b">
          {(["DAY", "WEEK", "MONTH", "YEAR"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "flex-1 py-3 text-xs font-semibold tracking-widest transition-colors border-b-2",
                period === p
                  ? "text-gray-900 border-[#b98b08]"
                  : "text-gray-400 border-transparent hover:text-gray-600",
              )}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Stat cards — CALLS filled amber, others outlined */}
        <div className="flex gap-3 px-4 py-4">
          <div
            className="flex-1 rounded-xl p-3 text-white flex flex-col items-center min-h-[84px] justify-center"
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
          <div className="flex-1 border border-gray-200 rounded-xl p-3 flex flex-col items-center min-h-[84px] justify-center">
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
          <div className="flex-1 border border-gray-200 rounded-xl p-3 flex flex-col items-center min-h-[84px] justify-center">
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
        <div className="flex-1 min-h-0 px-3 pb-64 pb-2">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div
                className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: AMBER }}
              />
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300">
              <BarChart2 className="w-10 h-10 mb-2" />
              <p className="text-sm text-gray-400">No data</p>
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
                <Tooltip
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
          {/* Footer */}
          <div className="px-5 py-3 border-t  text-xs text-gray-500 flex-shrink-0">
            {periodLabel}{" "}
            <span className="font-semibold text-gray-700">
              ( {leads.length} Leads )
            </span>
          </div>
        </div>
      </div>

      {/* ═══════ MIDDLE — Leads list ═══════ */}
      <div
        className={cn(
          "flex flex-col border-r bg-white transition-all duration-200",
          selectedLead ? "w-[400px] flex-shrink-0" : "flex-1",
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
              <p className="text-xs mt-1">Calls this period will appear here</p>
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

      {/* ═══════ RIGHT — Lead detail ═══════ */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          allOutcomes={allOutcomes}
          initialStages={initialStages}
          activeStages={activeStages}
          closedStages={closedStages}
        />
      )}
    </div>
  );
}
