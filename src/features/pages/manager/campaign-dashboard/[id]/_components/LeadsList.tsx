"use client";

import React, { useState } from "react";
import { Lead } from "../../../../../../types/leads.types";
import { Badge } from "../../../../../../components/ui/badge";
import { Input } from "../../../../../../components/ui/input";
import { Search, Star } from "lucide-react";

interface Props {
  leads: Lead[];
  loading: boolean;
  selectedLead: Lead | null;
  onSelectLead: (lead: Lead) => void;
}

type Tab = "fresh" | "active";

export default function LeadsList({
  leads,
  loading,
  selectedLead,
  onSelectLead,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("fresh");

  /* ================= TAB SPLIT ================= */
  const freshLeads = leads.filter((l) => l.status === "FRESH");
  const activeLeads = leads.filter((l) => l.status !== "FRESH");
  const tabLeads = activeTab === "fresh" ? freshLeads : activeLeads;

  /* ================= SEARCH ================= */
  const filteredLeads = tabLeads.filter((lead) => {
    const q = searchTerm.toLowerCase();
    return (
      lead.personName?.toLowerCase().includes(q) ||
      lead.companyName?.toLowerCase().includes(q) ||
      lead.phone?.includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "Not Interested": "bg-red-100 text-red-800",
      RNR: "bg-orange-100 text-orange-800",
      "Just Curocity": "bg-yellow-100 text-yellow-800",
      FRESH: "bg-green-100 text-green-800",
      ASSIGNED: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-purple-100 text-purple-800",
      Busy: "bg-orange-100 text-orange-800",
      "Switched Off": "bg-purple-100 text-purple-800",
      "Call Later": "bg-blue-100 text-blue-800",
      "Callback Scheduled": "bg-cyan-100 text-cyan-800",
      Interested: "bg-green-100 text-green-800",
      Won: "bg-green-200 text-green-900",
      Lost: "bg-red-200 text-red-900",
      "Not Picked Up": "bg-yellow-100 text-yellow-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#b98b08] mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading leads…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 border-r">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            @
            {leads.map((l) => l.campaign?.name).find((name) => name) ||
              "All Leads"}
          </h2>
          <Badge
            variant="secondary"
            className="bg-[#b98b08] text-white font-semibold"
          >
            {filteredLeads.length}{" "}
            {filteredLeads.length === 1 ? "Lead" : "Leads"}
          </Badge>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between border-b px-4">
          {(
            [
              { key: "active", label: "Active", count: activeLeads.length },
              { key: "fresh", label: "Fresh", count: freshLeads.length },
            ] as { key: Tab; label: string; count: number }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-3 pt-1 mr-6 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "text-[#b98b08]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label} ({tab.count})
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#b98b08] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, company or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto">
        {filteredLeads.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">No leads found</p>
              {searchTerm && (
                <p className="text-xs text-gray-400">
                  Try adjusting your search criteria
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {filteredLeads.map((lead) => {
              const isSelected = selectedLead?.id === lead.id;
              return (
                <div
                  key={lead.id}
                  onClick={() => onSelectLead(lead)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isSelected
                      ? "bg-amber-50 border-l-4 border-[#b98b08]"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-base truncate">
                        {lead.personName || "Unknown"}
                      </h3>
                      <p className="text-sm text-gray-500 truncate mt-0.5">
                        {lead.phone}
                      </p>
                    </div>
                    <Star className="w-4 h-4 text-gray-300 hover:text-yellow-500 cursor-pointer flex-shrink-0 mt-0.5" />
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-400">Status:</span>
                    <Badge className={`text-xs ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </Badge>
                  </div>

                  {lead.companyName && (
                    <p className="text-xs text-gray-400 truncate">
                      {lead.companyName}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
