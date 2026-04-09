"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import CallerFilterSidebar from "./_components/Callerfiltersidebar";
import LeadsSidebar from "./_components/Leadssidebar";
import LeadDetailPanel from "./_components/Leaddetailpanel";

export default function MyCallsPage() {
  const { campaignId } = useParams<{ campaignId: string }>();

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCallStats, setSelectedCallStats] = useState<string[]>([]);

  const { data: rawLeads = [] } = useQuery({
    queryKey: ["my-leads", campaignId],
    queryFn: async () => {
      // Always use /leads/my-leads — pass campaignId as query param to scope results
      const url = campaignId
        ? `/leads/my-leads?campaignId=${campaignId}`
        : "/leads/my-leads";
      const res = await api.get(url);
      return Array.isArray(res.data) ? res.data : (res.data.leads ?? []);
    },
  });

  const filteredLeads = useMemo(() => {
    if (selectedStatuses.length === 0) return rawLeads;
    return rawLeads.filter((l: any) => selectedStatuses.includes(l.status));
  }, [rawLeads, selectedStatuses]);

  const handleNext = (nextId: string | null) => {
    if (nextId) {
      setSelectedLeadId(nextId);
      return;
    }
    const idx = filteredLeads.findIndex((l: any) => l.id === selectedLeadId);
    const next = filteredLeads[idx + 1] ?? null;
    setSelectedLeadId(next?.id ?? null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="w-[440px] flex-shrink-0 border-r overflow-hidden">
        <CallerFilterSidebar
          campaignId={campaignId}
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          selectedCallStats={selectedCallStats}
          setSelectedCallStats={setSelectedCallStats}
        />
      </div>

      <div className="w-[380px] flex-shrink-0 border-r overflow-hidden">
        <LeadsSidebar
          selectedLeadId={selectedLeadId}
          onSelectLead={setSelectedLeadId}
          statusFilter={selectedStatuses}
          campaignId={campaignId}
        />
      </div>

      <div className="flex-1 min-w-0 overflow-hidden">
        <LeadDetailPanel
          leadId={selectedLeadId}
          onNext={handleNext}
          allLeads={filteredLeads}
        />
      </div>
    </div>
  );
}
