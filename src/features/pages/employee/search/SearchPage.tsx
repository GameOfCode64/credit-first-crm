"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Phone,
  AtSign,
  FileText,
  Building2,
  User,
  Star,
  MoreVertical,
  Search,
  PhoneCall,
  Clock,
  MessageSquare,
  UserCheck,
  FileCheck,
  ChevronDown,
  ChevronRight,
  Filter,
  Flag,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

type SearchMode = "Auto" | "Phone" | "Text" | "Email";

/* ─────────────────────────────────────
   HELPERS
   ───────────────────────────────────── */
const copyToClipboard = (text: string) => {
  if (!text) return;
  navigator.clipboard
    .writeText(text)
    .then(() => toast.success("Copied to clipboard"))
    .catch(() => toast.error("Failed to copy"));
};

const formatRelativeTime = (date: string) => {
  if (!date) return "";
  const diffMs = Date.now() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1d ago";
  if (diffDays < 30) return `${diffDays}d ago`;
  return `${Math.floor(diffDays / 30)}M`;
};

/* ─────────────────────────────────────
   ACTIVITY ROW
   ───────────────────────────────────── */
function ActivityRow({ activity, index, total }: any) {
  const [open, setOpen] = useState(false);
  const remark = activity.remark;
  const isLong = remark && remark.length > 60 && activity.type === "CALL";

  const Icon = () => {
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
      case "REMARK":
        return <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />;
      case "NOTE":
        return (
          <FileText className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
        );
      case "SOURCE":
        return <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />;
      default:
        return (
          <FileCheck className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        );
    }
  };

  const MainText = () => {
    switch (activity.type) {
      case "STATUS_CHANGE":
        return (
          <span className="text-sm text-gray-600">
            Status changed from{" "}
            <span className="text-gray-800">{activity.oldStatus || "—"}</span>
            {" → "}
            <span className="text-gray-800">{activity.newStatus || "—"}</span>
          </span>
        );
      case "CALL":
        return (
          <span className="flex items-baseline gap-1.5 flex-wrap">
            {activity.duration && (
              <span className="text-sm text-gray-900 font-mono">
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
              <span className="text-sm text-gray-500 truncate max-w-[200px]">
                {remark.slice(0, 58)}…
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
            <span className="font-semibold text-gray-800">
              {activity.user?.name || "—"}
            </span>
            {activity.assignee?.name && (
              <>
                {" → "}
                <span className="font-semibold text-gray-800">
                  {activity.assignee.name}
                </span>
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
            <span className="text-gray-800">
              {activity.source || remark || "—"}
            </span>
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
      <Icon />
      <div className="flex-1 min-w-0">
        <MainText />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
          {formatRelativeTime(activity.createdAt)}
        </span>
        {activity.user?.name && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
            style={{ backgroundColor: "#7c3aed" }}
            title={activity.user.name}
          >
            {activity.user.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        {isLong && (
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-gray-400 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   OUTCOME BUTTON
   ───────────────────────────────────── */
function OutcomeButton({
  outcome,
  outcomeId,
  setOutcomeId,
  setUiStatus,
  onSelect,
}: any) {
  const isSelected = outcomeId === outcome.id;
  return (
    <button
      onClick={() => {
        setOutcomeId(outcome.id);
        setUiStatus(outcome.name);
        onSelect?.();
      }}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between",
        isSelected
          ? "shadow-md"
          : "hover:bg-gray-50 border border-transparent hover:border-gray-200",
      )}
      style={{
        backgroundColor: isSelected ? `${outcome.color}15` : "transparent",
        color: isSelected ? outcome.color : "#374151",
        borderColor: isSelected ? `${outcome.color}40` : undefined,
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: outcome.color }}
        />
        <span className="font-medium">{outcome.name}</span>
      </div>
      {isSelected && (
        <CheckCircle2
          className="h-4 w-4 flex-shrink-0"
          style={{ color: outcome.color }}
        />
      )}
    </button>
  );
}

/* ─────────────────────────────────────
   LEAD DETAIL PANEL — employee design
   ───────────────────────────────────── */
function LeadDetailPanel({ lead }: { lead: any }) {
  const queryClient = useQueryClient();
  const [outcomeOpen, setOutcomeOpen] = useState(false);
  const [uiStatus, setUiStatus] = useState<string | null>(null);
  const [outcomeId, setOutcomeId] = useState<string | null>(null);
  const [reasonId, setReasonId] = useState<string | null>(null);
  const [remark, setRemark] = useState("");
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  useEffect(() => {
    setUiStatus(lead?.status || null);
    setOutcomeId(null);
    setReasonId(null);
    setRemark("");
    setFormValues({});
  }, [lead?.id]);

  useEffect(() => {
    setReasonId(null);
  }, [outcomeId]);

  const { data: activities = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ["lead-activities", lead?.id],
    queryFn: async () => (await api.get(`/leads/${lead.id}/activities`)).data,
    enabled: !!lead?.id,
  });

  const { data: pipeline } = useQuery({
    queryKey: ["pipeline"],
    queryFn: async () => (await api.get("/pipeline")).data,
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
      toast.success("Lead updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["lead-activities", lead?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["search-leads"] });
      setOutcomeId(null);
      setReasonId(null);
      setRemark("");
      setFormValues({});
    },
    onError: () => toast.error("Failed to update lead"),
  });

  const handleNext = async () => {
    if (!outcomeId) {
      toast.error("Please select a call outcome");
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

  const normalizeStage = (stage: any[] = []) =>
    stage.map((o: any) =>
      typeof o === "string"
        ? { id: o, name: o, color: "#466e62", reasons: [] }
        : o,
    );

  const initialStages = normalizeStage(pipeline?.initialStage);
  const activeStages = normalizeStage(pipeline?.activeStage);
  const closedStages = normalizeStage(pipeline?.closedStage);
  const allOutcomes = [...initialStages, ...activeStages, ...closedStages];
  const selectedOutcome = allOutcomes.find((o: any) => o.id === outcomeId);

  const getStatusStyle = (status: string) => {
    const stage = allOutcomes.find((o: any) => o.name === status);
    if (stage?.color)
      return { backgroundColor: stage.color + "20", color: stage.color };
    return { backgroundColor: "#ede9fe", color: "#7c3aed" };
  };

  const metaFields = lead?.meta ? Object.entries(lead.meta) : [];

  return (
    <div className="w-full bg-white flex flex-col h-full overflow-hidden shadow-lg border-l">
      {/* ── HEADER ── */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-xl font-semibold text-gray-900 truncate">
              {lead?.companyName || lead?.personName || "COMPANY NAME"}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {/* Outcome popover on status badge — same as employee */}
              <Popover open={outcomeOpen} onOpenChange={setOutcomeOpen}>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-1.5 group">
                    <Badge
                      className="text-xs font-medium border-0 cursor-pointer"
                      style={getStatusStyle(uiStatus || lead?.status)}
                    >
                      {uiStatus || lead?.status || "FRESH"}
                    </Badge>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-3" align="start">
                  <ScrollArea className="h-[50vh] max-h-[360px]">
                    <div className="space-y-3 pr-3">
                      {initialStages.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 px-2 py-1 uppercase">
                            Initial Stage
                          </p>
                          <div className="space-y-1">
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
                        </div>
                      )}
                      {activeStages.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 px-2 py-1 uppercase">
                            Active Stage
                          </p>
                          <div className="space-y-1">
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
                        </div>
                      )}
                      {closedStages.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-gray-500 px-2 py-1 uppercase">
                            Closed Stage
                          </p>
                          <div className="space-y-1">
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
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>

              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className="w-3.5 h-3.5 text-gray-300 fill-gray-300"
                  />
                ))}
              </div>
            </div>

            {/* Reason pills */}
            {selectedOutcome?.reasons?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {selectedOutcome.reasons.map((reason: any) => (
                  <Badge
                    key={reason.id}
                    variant={reasonId === reason.id ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-2.5 py-1 text-xs font-medium transition-all",
                      reasonId === reason.id
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white hover:bg-indigo-50 border-gray-300 text-gray-600",
                    )}
                    onClick={() =>
                      setReasonId((r: any) =>
                        r === reason.id ? null : reason.id,
                      )
                    }
                  >
                    {reason.label}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Right: assignee + icons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-sm text-gray-600 hidden md:block mr-1">
              {lead?.assignedTo?.name || "—"}
            </span>
            <div
              className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: "#f59e0b" }}
            >
              {lead?.assignedTo?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <button className="p-1.5 hover:bg-gray-100 rounded-full">
              <AtSign className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-full">
              <Flag className="w-4 h-4 text-gray-500" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-full">
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            {/* Next button — always visible in header */}
            <Button
              onClick={handleNext}
              disabled={!outcomeId || completeMutation.isPending}
              className="ml-2 bg-[#b98b08] hover:bg-[#b98b08]/90 text-white rounded-lg shadow-sm h-8 px-3 text-xs font-semibold"
            >
              {completeMutation.isPending ? "…" : "Next"}
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE BODY ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={
          {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          } as React.CSSProperties
        }
      >
        <div className="px-6 py-5">
          {/* Fields grid — 2 column, same as employee */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <Phone className="w-3.5 h-3.5" />
                <span>Phone</span>
                <button
                  onClick={() => copyToClipboard(lead?.phone || "")}
                  className="text-indigo-400 hover:text-indigo-600"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base">🇮🇳</span>
                <span className="text-sm font-semibold text-gray-900">
                  {lead?.phone || "—"}
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <AtSign className="w-3.5 h-3.5" />
                <span>Email</span>
              </div>
              <p className="text-sm text-gray-400">
                {lead?.meta?.email || "Empty"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Person Name</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {lead?.personName || "—"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Company Name</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {lead?.companyName || "—"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Status</span>
              </div>
              <Badge
                className="text-xs border-0"
                style={getStatusStyle(lead?.status)}
              >
                {lead?.status || "FRESH"}
              </Badge>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Assigned To</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {lead?.assignedTo?.name || "—"}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Campaign</span>
              </div>
              <p className="text-sm text-indigo-600 font-medium">
                {lead?.campaign?.name || "—"}
              </p>
            </div>

            {metaFields.map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="capitalize">{key}</span>
                </div>
                <p className="text-sm text-gray-400">
                  {(value as string) || "Empty"}
                </p>
              </div>
            ))}
          </div>

          {/* Show more divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-dashed border-gray-200" />
            <span className="text-xs text-gray-400">Show more</span>
            <div className="flex-1 border-t border-dashed border-gray-200" />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {[
              { icon: <PhoneCall className="w-5 h-5" />, label: "CALL" },
              { icon: <Clock className="w-5 h-5" />, label: "CALL LATER" },
              {
                icon: <MessageSquare className="w-5 h-5" />,
                label: "WHATSAPP",
              },
              { icon: <MessageSquare className="w-5 h-5" />, label: "SMS" },
              { icon: <FileText className="w-5 h-5" />, label: "ADD NOTE" },
            ].map(({ icon, label }) => (
              <Button
                key={label}
                variant="outline"
                className="flex flex-col items-center gap-2 border-none cursor-pointer h-auto py-3 hover:bg-gray-50 text-gray-600"
              >
                {icon}
                <span className="text-[10px] font-medium whitespace-nowrap">
                  {label}
                </span>
              </Button>
            ))}
          </div>

          <Separator className="mb-5" />

          {/* Tabs — Activity History + Remark + Form */}
          <Tabs defaultValue="activity" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-transparent p-0 h-auto border-b w-auto gap-0">
                {[
                  { value: "activity", label: "Activity History" },
                  { value: "remark", label: "Remark" },
                  { value: "form", label: "Form" },
                ].map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent rounded-none px-4 py-2 text-gray-500 whitespace-nowrap"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <Button
                variant="outline"
                size="sm"
                className="text-amber-600 border-amber-300 hover:bg-amber-50"
              >
                + Action
              </Button>
            </div>

            {/* Activity */}
            <TabsContent value="activity" className="mt-0">
              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Filter className="w-3.5 h-3.5" /> All Actions{" "}
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5" /> Time{" "}
                  <ChevronDown className="w-3 h-3" />
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <User className="w-3.5 h-3.5" /> Team{" "}
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
              {activitiesLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
                </div>
              ) : activities?.length > 0 ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  {activities.map((activity: any, index: number) => (
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      index={index}
                      total={activities.length}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No activity yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Activity will appear here as actions are taken
                  </p>
                </div>
              )}
            </TabsContent>

            {/* Remark */}
            <TabsContent value="remark" className="mt-0">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <label className="text-sm font-semibold text-gray-900 mb-3 block">
                  Call Remark
                </label>
                <Textarea
                  placeholder="Write detailed notes..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  rows={8}
                  className="resize-none text-sm"
                />
              </div>
            </TabsContent>

            {/* Form */}
            <TabsContent value="form" className="mt-0">
              <FormTab
                form={form}
                formValues={formValues}
                setFormValues={setFormValues}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   FORM TAB
   ───────────────────────────────────── */
function FormTab({ form, formValues, setFormValues }: any) {
  if (!form?.schema?.length) {
    return (
      <div className="text-center py-12">
        <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">No form configured</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-5">
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-1">{form.name}</h3>
        {form.description && (
          <p className="text-xs text-gray-600">{form.description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {form.schema.map((field: any) => (
          <div key={field.id} className="space-y-2">
            <label className="text-xs font-semibold text-gray-900 block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.type === "text" && (
              <Input
                value={formValues[field.id] || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, [field.id]: e.target.value })
                }
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className="text-sm"
              />
            )}
            {field.type === "number" && (
              <Input
                type="number"
                value={formValues[field.id] || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, [field.id]: e.target.value })
                }
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className="text-sm"
              />
            )}
            {field.type === "textarea" && (
              <Textarea
                value={formValues[field.id] || ""}
                onChange={(e) =>
                  setFormValues({ ...formValues, [field.id]: e.target.value })
                }
                placeholder={`Enter ${field.label.toLowerCase()}`}
                rows={4}
                className="text-sm resize-none"
              />
            )}
            {field.type === "date" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal text-sm",
                      !formValues[field.id] && "text-muted-foreground",
                    )}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {formValues[field.id]
                      ? format(new Date(formValues[field.id]), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      formValues[field.id]
                        ? new Date(formValues[field.id])
                        : undefined
                    }
                    onSelect={(date) =>
                      setFormValues({
                        ...formValues,
                        [field.id]: date?.toISOString(),
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
            {field.type === "select" && (
              <Select
                value={formValues[field.id]}
                onValueChange={(v) =>
                  setFormValues({ ...formValues, [field.id]: v })
                }
              >
                <SelectTrigger className="text-sm w-full">
                  <SelectValue
                    placeholder={`Select ${field.label.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt: string) => (
                    <SelectItem key={opt} value={opt} className="text-sm">
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   SEARCH RESULT ITEM
   ───────────────────────────────────── */
function SearchResultItem({
  lead,
  selected,
  onClick,
}: {
  lead: any;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors",
        selected && "bg-amber-50 border-l-4 border-l-amber-500",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {lead.personName || lead.companyName || "Unknown"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{lead.phone}</p>
          {lead.companyName && lead.personName && (
            <p className="text-xs text-gray-400 truncate">{lead.companyName}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "#ede9fe", color: "#7c3aed" }}
          >
            {lead.status}
          </span>
          {lead.assignedTo?.name && (
            <span className="text-[10px] text-gray-400">
              {lead.assignedTo.name}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────── */
export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("Auto");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isLoading } = useQuery({
    queryKey: ["search-leads", debouncedQuery, mode],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const params: Record<string, string> = { q: debouncedQuery };
      if (mode !== "Auto") params.mode = mode.toLowerCase();
      return (await api.get("/leads/search", { params })).data;
    },
    enabled: debouncedQuery.trim().length > 0,
  });

  useEffect(() => {
    if (results.length > 0) setSelectedLead(results[0]);
    if (results.length === 0) setSelectedLead(null);
  }, [results]);

  const modes: SearchMode[] = ["Auto", "Phone", "Text", "Email"];
  const modeIcons: Record<SearchMode, React.ReactNode> = {
    Auto: <Search className="w-3.5 h-3.5" />,
    Phone: <Phone className="w-3.5 h-3.5" />,
    Text: <FileText className="w-3.5 h-3.5" />,
    Email: <AtSign className="w-3.5 h-3.5" />,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* ── LEFT: Search ── */}
      <div className="w-[380px] flex-shrink-0 bg-white border-r flex flex-col">
        <div className="px-5 py-4 border-b">
          <h2 className="font-bold text-base text-gray-900 mb-3">
            Search leads
          </h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a lead's name, phone or other details"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent bg-white"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#b98b08]" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {modes.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  mode === m
                    ? "bg-[#b98b08] text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200",
                )}
              >
                {modeIcons[m]}
                {m}
              </button>
            ))}
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#e5e7eb transparent",
          }}
        >
          {!debouncedQuery.trim() ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-16">
              <Search className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-500">
                Enter search value to see results here
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 pb-16">
              <Search className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm font-medium text-gray-600">
                No leads found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div>
              <p className="px-4 py-2 text-xs text-gray-400 font-medium border-b border-gray-100">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </p>
              {results.map((lead: any) => (
                <SearchResultItem
                  key={lead.id}
                  lead={lead}
                  selected={selectedLead?.id === lead.id}
                  onClick={() => setSelectedLead(lead)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Lead detail ── */}
      <div className="flex-1 overflow-hidden">
        {selectedLead ? (
          <LeadDetailPanel lead={selectedLead} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
            <Search className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-base font-medium text-gray-500">
              Search for a lead
            </p>
            <p className="text-sm mt-1">Results will appear on the left</p>
          </div>
        )}
      </div>
    </div>
  );
}
