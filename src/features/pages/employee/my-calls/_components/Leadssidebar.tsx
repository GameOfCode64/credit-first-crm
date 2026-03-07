"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Search, Phone, Star, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";

interface Props {
  selectedLeadId: string | null;
  onSelectLead: (id: string) => void;
  statusFilter?: string[]; // From CallerFilterSidebar
  campaignId?: string; // If provided, scope leads to this campaign
}

export default function LeadsSidebar({
  selectedLeadId,
  onSelectLead,
  statusFilter = [],
  campaignId,
}: Props) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"TO_CALL" | "CALLED">("TO_CALL");

  /* Fetch leads — campaign-scoped if campaignId is provided */
  const { data: leads = [], isLoading } = useQuery({
    queryKey: campaignId ? ["my-campaign-leads", campaignId] : ["my-leads"],
    queryFn: async () => {
      const url = campaignId
        ? `/campaigns/${campaignId}/my-leads`
        : "/leads/my-leads";
      const res = await api.get(url);
      /* Both endpoints return either an array or { leads: [] } */
      return Array.isArray(res.data) ? res.data : (res.data.leads ?? []);
    },
  });

  /* Apply filters from left sidebar + local search */
  const filteredLeads = useMemo(() => {
    let result = leads;

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (l: any) =>
          l.personName?.toLowerCase().includes(term) ||
          l.companyName?.toLowerCase().includes(term) ||
          l.phone?.includes(term),
      );
    }

    /* Status filter from pie-chart clicks */
    if (statusFilter.length > 0) {
      result = result.filter((l: any) => statusFilter.includes(l.status));
    }

    return result;
  }, [leads, search, statusFilter]);

  /* Tab split — Fresh (never called today) vs Active (called today) */
  const list = useMemo(() => {
    return filteredLeads.filter((l: any) =>
      activeTab === "CALLED" ? l.calledToday : !l.calledToday,
    );
  }, [filteredLeads, activeTab]);

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      FRESH: "bg-blue-100 text-blue-700",
      RNR: "bg-yellow-100 text-yellow-700",
      INTERESTED: "bg-green-100 text-green-700",
      "NOT INTERESTED": "bg-red-100 text-red-700",
      WON: "bg-emerald-100 text-emerald-700",
      LOST: "bg-gray-200 text-gray-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* HEADER */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">My Calls</h2>
          <Badge variant="secondary" className="text-xs">
            {filteredLeads.length}
          </Badge>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* TABS */}
        <div className="flex items-center justify-between text-sm font-medium">
          <button
            onClick={() => setActiveTab("TO_CALL")}
            className={cn(
              "pb-1",
              activeTab === "TO_CALL" &&
                "border-b-2 border-[#b98b08] text-[#b98b08]",
            )}
          >
            Fresh ({filteredLeads.filter((l: any) => !l.calledToday).length})
          </button>

          <button
            onClick={() => setActiveTab("CALLED")}
            className={cn(
              "pb-1",
              activeTab === "CALLED" &&
                "border-b-2 border-[#b98b08] text-[#b98b08]",
            )}
          >
            Active ({filteredLeads.filter((l: any) => l.calledToday).length})
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {isLoading ? (
            <div className="p-4 text-sm text-gray-500">Loading…</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              {filteredLeads.length === 0
                ? "No leads match filters"
                : "No leads in this tab"}
            </div>
          ) : (
            list.map((lead: any) => {
              const isActive = selectedLeadId === lead.id;

              return (
                <button
                  key={lead.id}
                  onClick={() => onSelectLead(lead.id)}
                  className={cn(
                    "w-full p-3 border-b text-left hover:bg-gray-50 transition-colors",
                    isActive && "bg-[#fef9e7] border-l-4 border-l-[#b98b08]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold truncate">
                          {lead.personName || lead.companyName || "Unknown"}
                        </p>
                        {lead.calledToday && (
                          <Phone className="h-3 w-3 text-green-600 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-xs text-gray-600 truncate mb-1">
                        {lead.phone}
                      </p>

                      <Badge
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4",
                          getStatusColor(lead.status),
                        )}
                      >
                        {lead.status}
                      </Badge>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 text-gray-400 transition-colors",
                          isActive && "text-[#b98b08]",
                        )}
                      />
                      <Star
                        className={cn(
                          "h-3.5 w-3.5",
                          lead.starred
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300",
                        )}
                      />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
