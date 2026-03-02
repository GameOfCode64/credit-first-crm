"use client";

import React, { useState } from "react";
import CallerFilterSidebar from "./_components/Callerfiltersidebar";
import LeadsSidebar from "./_components/Leadssidebar";
import LeadDetailPanel from "./_components/Leaddetailpanel";

export default function CallerDashboard() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedCallStats, setSelectedCallStats] = useState<string[]>([]);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* LEFT: Filter Sidebar — Leads Status + Calling Report */}
      <div className="w-[360px] border-r bg-white shadow-sm flex-shrink-0">
        <CallerFilterSidebar
          selectedStatuses={selectedStatuses}
          setSelectedStatuses={setSelectedStatuses}
          selectedCallStats={selectedCallStats}
          setSelectedCallStats={setSelectedCallStats}
        />
      </div>

      {/* MIDDLE: Leads List */}
      <div className="w-[400px] border-r bg-white shadow-sm flex-shrink-0">
        <LeadsSidebar
          selectedLeadId={selectedLeadId}
          onSelectLead={setSelectedLeadId}
          statusFilter={selectedStatuses}
        />
      </div>

      {/* RIGHT: Lead Details */}
      <div className="flex-1 overflow-hidden">
        <LeadDetailPanel
          leadId={selectedLeadId}
          onNext={(nextId) => setSelectedLeadId(nextId)}
        />
      </div>
    </div>
  );
}
