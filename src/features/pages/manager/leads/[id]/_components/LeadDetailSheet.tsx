"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  X,
  Phone,
  Building2,
  User,
  Calendar,
  FileText,
  Clock,
  MessageSquare,
  Star,
  MoreVertical,
  AtSign,
  Flag,
  Copy,
  PhoneCall,
  UserCheck,
  FileCheck,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { api } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
}

export default function LeadDetailSheet({ open, onClose, leadId }: Props) {
  const [showMore, setShowMore] = useState(false);

  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ["lead-detail", leadId],
    queryFn: async () => {
      if (!leadId) return null;
      const res = await api.get(`/leads/${leadId}`);
      return res.data;
    },
    enabled: open && !!leadId,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["lead-activities", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const res = await api.get(`/leads/${leadId}/activities`);
      return res.data;
    },
    enabled: open && !!leadId,
  });

  const { data: formResponses, isLoading: formsLoading } = useQuery({
    queryKey: ["lead-forms", leadId],
    queryFn: async () => {
      if (!leadId) return [];
      const res = await api.get(`/leads/${leadId}/forms`);
      return res.data;
    },
    enabled: open && !!leadId,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Not set";
    return format(new Date(date), "dd/MM/yyyy HH:mm:ss");
  };

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "CALL":
        return <PhoneCall className="h-4 w-4 text-green-500" />;
      case "STATUS_CHANGE":
        return (
          <div className="w-4 h-4 rounded-full border-2 border-blue-400" />
        );
      case "ASSIGNED":
        return <UserCheck className="h-4 w-4 text-[#b98b08]" />;
      case "REMARK":
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <FileCheck className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityTitle = (activity: any) => {
    switch (activity.type) {
      case "CALL":
        return activity.outcome?.name || "Call Made";
      case "STATUS_CHANGE":
        return `Status changed from ${activity.oldStatus || "—"} → ${activity.newStatus || "—"}`;
      case "ASSIGNED":
        return "Lead Assigned";
      case "REMARK":
        return "Note Added";
      default:
        return activity.type;
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      FRESH: "bg-blue-50 text-blue-700 border-blue-200",
      INTERESTED: "bg-green-50 text-green-700 border-green-200",
      WON: "bg-emerald-50 text-emerald-700 border-emerald-200",
      LOST: "bg-red-50 text-red-700 border-red-200",
      "NOT INTERESTED": "bg-gray-50 text-gray-700 border-gray-200",
    };
    return statusColors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getFieldLabel = (fieldId: string, schema: any[]) => {
    const field = schema?.find((f: any) => f.id === fieldId);
    return field?.label || fieldId;
  };

  const metaFields = lead?.meta ? Object.entries(lead.meta) : [];

  const basicFields = [
    { label: "Person Name", value: lead?.personName, icon: User },
    { label: "Company Name", value: lead?.companyName, icon: Building2 },
    {
      label: "Phone",
      value: lead?.phone,
      icon: Phone,
      copyable: true,
      flag: "🇮🇳",
    },
    { label: "Status", value: lead?.status, icon: FileText, badge: true },
    {
      label: "Campaign",
      value: lead?.campaign?.name,
      icon: FileText,
      badge: true,
      color: "purple",
    },
    {
      label: "Assigned To",
      value: lead?.assignedTo?.name || "Unassigned",
      icon: User,
    },
  ];

  const dateFields = [
    { label: "Created At", value: lead?.createdAt },
    { label: "Updated At", value: lead?.updatedAt },
    { label: "Follow Up At", value: lead?.followUpAt },
  ];

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="w-[900px] p-0">
        {leadLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b98b08] mx-auto"></div>
              <p className="text-gray-600">Loading lead details...</p>
            </div>
          </div>
        ) : lead ? (
          <ScrollArea className="h-full">
            {/* ================= HEADER ================= */}
            <div className="border-b bg-white p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {lead.companyName || lead.personName || "Unnamed Lead"}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className={getStatusColor(lead.status)}
                    >
                      {lead.status}
                    </Badge>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 text-gray-300 fill-gray-300"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {lead.assignedTo && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {lead.assignedTo.name}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#b98b08] text-white flex items-center justify-center text-sm font-medium">
                        {lead.assignedTo.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    </div>
                  )}
                  <Button variant="ghost" size="icon">
                    <AtSign className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Flag className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* INFO GRID */}
              <div className="grid grid-cols-2 gap-4">
                {basicFields.map((field, index) => (
                  <div key={index}>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <field.icon className="h-4 w-4" />
                      {field.label}
                      {field.copyable && (
                        <button
                          onClick={() => copyToClipboard(field.value || "")}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {field.flag && (
                        <span className="text-xl">{field.flag}</span>
                      )}
                      {field.badge ? (
                        <Badge
                          variant="secondary"
                          className={
                            field.color === "purple"
                              ? "bg-purple-50 text-purple-700"
                              : getStatusColor(field.value || "")
                          }
                        >
                          {field.value || "—"}
                        </Badge>
                      ) : (
                        <span className="text-sm font-medium">
                          {field.value || "—"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {/* META FIELDS */}
                {metaFields.map(([key, value]: [string, any]) => (
                  <div key={key}>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                      <FileText className="h-4 w-4" />
                      {key}
                    </div>
                    <div className="text-sm text-gray-400">
                      {value || "Empty"}
                    </div>
                  </div>
                ))}

                {/* DATE FIELDS */}
                {showMore &&
                  dateFields.map((field, index) => (
                    <div key={index}>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="h-4 w-4" />
                        {field.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(field.value)}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Show More Toggle */}
              <div className="mt-4 text-center border-t pt-3">
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  {showMore ? "Show less ∧" : "Show more ∨"}
                </button>
              </div>

              {/* ACTION BUTTONS */}
              <div className="grid grid-cols-5 gap-2 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                >
                  <Phone className="h-5 w-5" />
                  <span className="text-xs font-medium">CALL</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                >
                  <Clock className="h-5 w-5" />
                  <span className="text-xs font-medium">CALL LATER</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">WHATSAPP</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-medium">SMS</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300"
                >
                  <FileText className="h-5 w-5" />
                  <span className="text-xs font-medium">ADD NOTE</span>
                </Button>
              </div>
            </div>

            {/* ================= TABS SECTION ================= */}
            <div className="bg-gray-50">
              <Tabs defaultValue="activity">
                <div className="border-b bg-white px-6">
                  <div className="flex items-center justify-between">
                    <TabsList className="bg-transparent border-0 p-0">
                      <TabsTrigger
                        value="activity"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-[#b98b08] rounded-none px-4 py-3 text-gray-600 data-[state=active]:text-[#b98b08]"
                      >
                        Activity History
                      </TabsTrigger>
                      <TabsTrigger
                        value="forms"
                        className="data-[state=active]:border-b-2 data-[state=active]:border-[#b98b08] rounded-none px-4 py-3 text-gray-600 data-[state=active]:text-[#b98b08]"
                      >
                        Forms
                      </TabsTrigger>
                    </TabsList>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#b98b08] text-[#b98b08] hover:bg-[#fef9e7]"
                    >
                      + Action
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  {/* ACTIVITY TAB */}
                  <TabsContent value="activity" className="mt-0 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Button variant="outline" size="sm" className="gap-2">
                        🔍 All Actions
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Clock className="h-4 w-4" /> Time
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <User className="h-4 w-4" /> Team
                      </Button>
                    </div>

                    {activitiesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b98b08] mx-auto"></div>
                      </div>
                    ) : activities && activities.length > 0 ? (
                      activities.map((activity: any, index: number) => (
                        <div
                          key={activity.id || index}
                          className="flex items-start gap-3 pb-4 border-b last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-gray-300" />
                            {getActivityIcon(activity.type)}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm text-gray-700 font-medium">
                                  {getActivityTitle(activity)}
                                </p>
                                {activity.remark && (
                                  <p className="text-xs text-gray-500 italic mt-0.5">
                                    {activity.remark}
                                  </p>
                                )}
                                {activity.outcomeReason && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    Reason: {activity.outcomeReason.label}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {formatRelativeTime(activity.createdAt)}
                                </span>
                                {activity.user && (
                                  <div className="w-6 h-6 rounded-full bg-[#b98b08] text-white flex items-center justify-center text-xs font-medium">
                                    {activity.user.name
                                      ?.charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">
                          No activity yet
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Activity will appear here as actions are taken
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  {/* FORMS TAB */}
                  <TabsContent value="forms" className="mt-0">
                    {formsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b98b08] mx-auto"></div>
                      </div>
                    ) : formResponses && formResponses.length > 0 ? (
                      <div className="space-y-4">
                        {formResponses.map((response: any) => (
                          <div
                            key={response.id}
                            className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {response.form?.name || "Form Response"}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  Submitted by {response.user?.name} on{" "}
                                  {formatDate(response.createdAt)}
                                </p>
                              </div>
                              <FileCheck className="h-5 w-5 text-green-500" />
                            </div>
                            <div className="space-y-2">
                              {Object.entries(response.values || {}).map(
                                ([fieldId, value]: [string, any]) => (
                                  <div
                                    key={fieldId}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="text-gray-600 font-medium">
                                      {getFieldLabel(
                                        fieldId,
                                        response.form?.schema ||
                                          response.schemaSnapshot,
                                      )}
                                      :
                                    </span>
                                    <span className="text-gray-900">
                                      {String(value)}
                                    </span>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">
                          No forms submitted
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Form responses will appear here
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </ScrollArea>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <User className="h-16 w-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">
                No lead data available
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
