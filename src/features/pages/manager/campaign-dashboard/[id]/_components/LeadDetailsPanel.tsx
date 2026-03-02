"use client";

// Manager lead info

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../../../../../../components/ui/button";
import { Badge } from "../../../../../../components/ui/badge";
import { Separator } from "../../../../../../components/ui/separator";
import { Input } from "../../../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../../../components/ui/tabs";
import {
  Phone,
  Building2,
  User,
  Calendar,
  MessageSquare,
  Clock,
  FileText,
  Copy,
  Star,
  MoreVertical,
  AtSign,
  Flag,
  X,
  Edit2,
  Check,
  PhoneCall,
  UserCheck,
  FileCheck,
  ChevronDown,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface PipelineStage {
  id: string;
  name: string;
  color?: string;
  stage: string;
}

interface Props {
  lead: any;
  pipeline?: {
    initialStage?: string[];
    activeStage?: PipelineStage[];
    closedStage?: PipelineStage[];
  };
  onUpdate?: (data: any) => void;
  onClose: () => void;
}

/* ================= ACTIVITY ROW ================= */
function ActivityRow({ activity, index, total, formatRelativeTime }: any) {
  const [open, setOpen] = useState(false);
  const remark = activity.remark;
  const isLong = remark && remark.length > 60;

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
            <span className="text-sm  text-gray-900">
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
        isLong && activity.type === "CALL" && "cursor-pointer",
      )}
      onClick={() => isLong && activity.type === "CALL" && setOpen((v) => !v)}
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
        {isLong && activity.type === "CALL" && (
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

/* ================= MAIN PANEL ================= */
export default function LeadDetailsPanel({
  lead,
  pipeline,
  onUpdate,
  onClose,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [editedLead, setEditedLead] = useState({
    personName: "",
    phone: "",
    companyName: "",
    status: "",
    meta: {} as Record<string, any>,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["lead-activities", lead?.id],
    queryFn: async () => {
      if (!lead?.id) return [];
      const response = await api.get(`/leads/${lead.id}/activities`);
      return response.data;
    },
    enabled: !!lead?.id,
  });

  const { data: formResponses, isLoading: formsLoading } = useQuery({
    queryKey: ["lead-forms", lead?.id],
    queryFn: async () => {
      if (!lead?.id) return [];
      const response = await api.get(`/leads/${lead.id}/forms`);
      return response.data;
    },
    enabled: !!lead?.id,
  });

  useEffect(() => {
    if (lead) {
      setEditedLead({
        personName: lead.personName || "",
        phone: lead.phone || "",
        companyName: lead.companyName || "",
        status: lead.status || "",
        meta: { ...lead.meta } || {},
      });
    }
  }, [lead]);

  const getAllStatuses = () => {
    const statuses: { name: string; color?: string }[] = [];
    pipeline?.initialStage?.forEach((name) =>
      statuses.push({ name, color: "#94a3b8" }),
    );
    pipeline?.activeStage?.forEach((s) =>
      statuses.push({ name: s.name, color: s.color }),
    );
    pipeline?.closedStage?.forEach((s) =>
      statuses.push({ name: s.name, color: s.color }),
    );
    return statuses;
  };

  const allStatuses = getAllStatuses();

  const getStatusStyle = (status: string) => {
    const allStages = [
      ...(pipeline?.activeStage || []),
      ...(pipeline?.closedStage || []),
    ];
    const stage = allStages.find((s) => s.name === status);
    if (stage?.color)
      return { backgroundColor: stage.color + "20", color: stage.color };
    return { backgroundColor: "#ede9fe", color: "#7c3aed" };
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

  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSave = () => {
    if (onUpdate) onUpdate(editedLead);
    toast.success("Lead updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedLead({
      personName: lead.personName || "",
      phone: lead.phone || "",
      companyName: lead.companyName || "",
      status: lead.status || "",
      meta: { ...lead.meta } || {},
    });
    setIsEditing(false);
  };

  const metaFields = lead?.meta ? Object.entries(lead.meta) : [];

  return (
    <div className="w-full max-w-[950px] bg-white flex flex-col h-screen  shadow-lg border-l">
      {/* ── FIXED HEADER ── */}
      <div className="flex-shrink-0 border-b bg-white px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-xl font-semibold text-gray-900 mb-2 truncate">
              {lead?.companyName || "COMPANY NAME"}
            </h1>
            <div className="flex items-center gap-2">
              <Badge
                className="text-xs font-medium border-0"
                style={getStatusStyle(lead?.status)}
              >
                {lead?.status || "FRESH"}
              </Badge>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 text-gray-300 fill-gray-300"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-sm text-gray-600 hidden md:block mr-1">
              {lead?.assignedTo?.name || "—"}
            </span>
            <div
              className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-semibold flex-shrink-0"
              style={{ backgroundColor: "#f59e0b" }}
            >
              {lead?.assignedTo?.name?.charAt(0).toUpperCase() || "?"}
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
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE BODY — scrollbar fully hidden ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={
          {
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          } as React.CSSProperties
        }
      >
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        <div className="hide-scrollbar px-6 py-5">
          {/* Edit button */}
          <div className="flex justify-end mb-5">
            {!isEditing ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
              >
                <Edit2 className="w-3 h-3 mr-1.5" /> Edit Lead
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="w-3 h-3 mr-1.5" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  <Check className="w-3 h-3 mr-1.5" /> Save
                </Button>
              </div>
            )}
          </div>

          {/* ── Lead Fields Grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-4">
            {/* Phone */}
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
              {isEditing ? (
                <Input
                  value={editedLead.phone}
                  onChange={(e) =>
                    setEditedLead({ ...editedLead, phone: e.target.value })
                  }
                  className="text-sm"
                />
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🇮🇳</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {lead?.phone || "—"}
                  </span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <AtSign className="w-3.5 h-3.5" />
                <span>Email</span>
              </div>
              <p className="text-sm text-gray-400">
                {lead?.meta?.email || "Empty"}
              </p>
            </div>

            {/* Person Name */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Person Name</span>
              </div>
              {isEditing ? (
                <Input
                  value={editedLead.personName}
                  onChange={(e) =>
                    setEditedLead({ ...editedLead, personName: e.target.value })
                  }
                  className="text-sm"
                />
              ) : (
                <p className="text-sm font-semibold text-gray-900">
                  {lead?.personName || "—"}
                </p>
              )}
            </div>

            {/* Company */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Company Name</span>
              </div>
              {isEditing ? (
                <Input
                  value={editedLead.companyName}
                  onChange={(e) =>
                    setEditedLead({
                      ...editedLead,
                      companyName: e.target.value,
                    })
                  }
                  className="text-sm"
                />
              ) : (
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {lead?.companyName || "—"}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Status</span>
              </div>
              {isEditing ? (
                <Select
                  value={editedLead.status}
                  onValueChange={(v) =>
                    setEditedLead({ ...editedLead, status: v })
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allStatuses.map((s) => (
                      <SelectItem key={s.name} value={s.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge
                  className="text-xs border-0"
                  style={getStatusStyle(lead?.status)}
                >
                  {lead?.status || "FRESH"}
                </Badge>
              )}
            </div>

            {/* Assigned To */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Assigned To</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {lead?.assignedTo?.name || "—"}
              </p>
            </div>

            {/* Campaign */}
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Campaign</span>
              </div>
              <p className="text-sm text-indigo-600 font-medium">
                {lead?.campaign?.name || "—"}
              </p>
            </div>

            {/* Meta fields */}
            {metaFields.map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="capitalize">{key}</span>
                </div>
                {isEditing ? (
                  <Input
                    value={editedLead.meta[key] || ""}
                    onChange={(e) =>
                      setEditedLead({
                        ...editedLead,
                        meta: { ...editedLead.meta, [key]: e.target.value },
                      })
                    }
                    placeholder="Empty"
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm text-gray-400">
                    {(value as string) || "Empty"}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Show More */}
          {showMore && (
            <>
              <Separator className="my-5" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Created At</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(lead?.createdAt)}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Updated At</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(lead?.updatedAt)}
                  </p>
                </div>
                {lead?.followUpAt && (
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Follow Up At</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(lead.followUpAt)}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Show more toggle */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 border-t border-dashed border-gray-200" />
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showMore ? "Show less" : "Show more"}
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform",
                  showMore && "rotate-180",
                )}
              />
            </button>
            <div className="flex-1 border-t border-dashed border-gray-200" />
          </div>

          {/* ── Action Buttons ── */}
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

          {/* ── Tabs ── */}
          <Tabs defaultValue="activity" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-transparent p-0 h-auto border-b w-auto gap-0">
                {["activity", "forms"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent rounded-none px-4 py-2 text-gray-500 capitalize whitespace-nowrap"
                  >
                    {tab === "activity" ? "Activity History" : "Forms"}
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

            {/* Activity Tab */}
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
              ) : activities && activities.length > 0 ? (
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
                  {activities.map((activity: any, index: number) => (
                    <ActivityRow
                      key={activity.id}
                      activity={activity}
                      index={index}
                      total={activities.length}
                      formatRelativeTime={formatRelativeTime}
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

            {/* Forms Tab */}
            <TabsContent value="forms" className="mt-0">
              {formsLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-indigo-600" />
                </div>
              ) : formResponses && formResponses.length > 0 ? (
                <div className="space-y-4">
                  {formResponses.map((response: any) => {
                    const schema: any[] =
                      response.form?.schema || response.schemaSnapshot || [];
                    const values = response.values || {};
                    return (
                      <div
                        key={response.id}
                        className="border rounded-lg p-4 bg-white hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3 gap-2">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {response.form?.name || "Form Response"}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Submitted by {response.user?.name} on{" "}
                              {formatDate(response.createdAt)}
                            </p>
                          </div>
                          <FileCheck className="h-5 w-5 text-green-500 flex-shrink-0" />
                        </div>
                        <div className="space-y-2">
                          {schema.length > 0
                            ? schema.map((field: any) => {
                                const val = values[field.id];
                                if (
                                  val === undefined ||
                                  val === null ||
                                  val === ""
                                )
                                  return null;
                                return (
                                  <div
                                    key={field.id}
                                    className="flex justify-between gap-4 text-sm"
                                  >
                                    <span className="text-gray-500 flex-shrink-0">
                                      {field.label}:
                                    </span>
                                    <span className="text-gray-900 text-right break-words">
                                      {String(val)}
                                    </span>
                                  </div>
                                );
                              })
                            : Object.entries(values).map(
                                ([k, v]: [string, any]) => (
                                  <div
                                    key={k}
                                    className="flex justify-between gap-4 text-sm"
                                  >
                                    <span className="text-gray-500 flex-shrink-0">
                                      {k}:
                                    </span>
                                    <span className="text-gray-900 text-right break-words">
                                      {String(v)}
                                    </span>
                                  </div>
                                ),
                              )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">
                    No forms submitted
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Form responses will appear here
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
