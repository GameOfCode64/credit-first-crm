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

  /* ── Shared filter state (owned here, passed down) ── */
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCallStats, setSelectedCallStats] = useState<string[]>([]);

  /* ── Fetch leads once here so LeadsSidebar + LeadDetailPanel share
        the same list (needed for correct "Next" navigation) ── */
  const { data: rawLeads = [], isLoading } = useQuery({
    queryKey: campaignId ? ["my-campaign-leads", campaignId] : ["my-leads"],
    queryFn: async () => {
      const url = campaignId
        ? `/campaigns/${campaignId}/my-leads`
        : "/leads/my-leads";
      const res = await api.get(url);
      return Array.isArray(res.data) ? res.data : (res.data.leads ?? []);
    },
  });

  /* ── Apply status filter (from pie-chart clicks) ── */
  const filteredLeads = useMemo(() => {
    if (selectedStatuses.length === 0) return rawLeads;
    return rawLeads.filter((l: any) => selectedStatuses.includes(l.status));
  }, [rawLeads, selectedStatuses]);

  /* ── When LeadDetailPanel fires Next, advance to next in filtered list ── */
  const handleNext = (nextId: string | null) => {
    if (nextId) {
      setSelectedLeadId(nextId);
      return;
    }
    /* nextId null means "go to next" — find current position */
    const idx = filteredLeads.findIndex((l: any) => l.id === selectedLeadId);
    const next = filteredLeads[idx + 1] ?? null;
    setSelectedLeadId(next?.id ?? null);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* ══════════════════════════════════
          PANEL 1  —  CallerFilterSidebar
          "My Overview" — Leads Status pie
          + Campaign Calling Report pie.
          Clicking a pie slice filters Panel 2.
          ══════════════════════════════════ */}
      <div className="w-[440px] flex-shrink-0 border-r overflow-hidden">
        <CallerFilterSidebar
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          selectedCallStats={selectedCallStats}
          setSelectedCallStats={setSelectedCallStats}
        />
      </div>

      {/* ══════════════════════════════════
          PANEL 2  —  LeadsSidebar
          "My Calls" — search + Fresh/Active
          tabs. Receives the pre-filtered list
          so it stays in sync with Panel 1.
          ══════════════════════════════════ */}
      <div className="w-[380px] flex-shrink-0 border-r overflow-hidden">
        <LeadsSidebar
          selectedLeadId={selectedLeadId}
          onSelectLead={setSelectedLeadId}
          statusFilter={selectedStatuses}
          campaignId={campaignId}
        />
      </div>

      {/* ══════════════════════════════════
          PANEL 3  —  LeadDetailPanel
          Full lead info, outcome popover,
          reason pills, Next button,
          Activity / Remark / Form tabs.
          allLeads drives correct Next order.
          ══════════════════════════════════ */}
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
