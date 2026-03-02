import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import {
  fetchLeads,
  fetchEmployees,
} from "../../../../../services/leads.service";
import {
  fetchLeadById,
  logCall,
  changeLeadStatus,
} from "../../../../../services/lead.service";
import { fetchPipeline } from "../../../../../services/pipeline.service";

import { Lead, LeadStatus } from "../../../../../types/leads.types";

import FiltersSidebar from "./_components/FiltersSidebar";
import LeadsList from "./_components/LeadsList";
import LeadDetailsPanel from "./_components/LeadDetailsPanel";

export default function CampaignDashboardPage() {
  const qc = useQueryClient();
  const { id: campaignId } = useParams<{ id: string }>();

  /* ================= STATE ================= */
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<LeadStatus[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  /* ================= QUERIES ================= */

  const { data: pipeline } = useQuery({
    queryKey: ["pipeline"],
    queryFn: fetchPipeline,
  });

  /**
   * Page 1 — used for the leads list (paginated display)
   */
  const { data: campaignLeadsRes, isLoading } = useQuery({
    queryKey: ["leads", campaignId],
    queryFn: () => fetchLeads({ campaignId, page: 1 }),
    enabled: !!campaignId,
  });

  const campaignLeads: Lead[] = campaignLeadsRes?.data ?? [];
  const pagination = campaignLeadsRes?.pagination;

  /**
   * All pages — fetched in parallel for sidebar charts + stats
   * We know total from page 1, then fetch remaining pages
   */
  const totalPages = pagination
    ? Math.ceil(pagination.total / pagination.limit)
    : 1;

  const allPageQueries = useQuery({
    queryKey: ["leads-all", campaignId, totalPages],
    queryFn: async () => {
      if (totalPages <= 1) return campaignLeads;

      const pagePromises = Array.from({ length: totalPages - 1 }, (_, i) =>
        fetchLeads({ campaignId, page: i + 2 }).then((res) => res?.data ?? []),
      );
      const rest = await Promise.all(pagePromises);
      return [...campaignLeads, ...rest.flat()];
    },
    enabled: !!campaignId && !!pagination,
  });

  const allLeads: Lead[] = allPageQueries.data ?? campaignLeads;

  /* ================= DERIVED CAMPAIGN INFO ================= */
  // Derive campaign info directly from leads (no separate API needed)
  const campaignInfo = useMemo(() => {
    if (!allLeads.length) return null;
    const first = allLeads[0] as any;
    const name = first?.campaign?.name ?? "Campaign";
    const total = pagination?.total ?? allLeads.length;

    // Count completed = leads whose status is NOT FRESH and NOT initial
    const completedStatuses = [
      "Interested",
      "Connected",
      "Callback Scheduled",
      "Call Later",
    ];
    const completed = allLeads.filter((l) =>
      completedStatuses.includes(l.status),
    ).length;

    // Unique assigned employees derived from leads
    const empMap: Record<string, { id: string; name: string }> = {};
    allLeads.forEach((lead: any) => {
      const id = lead.assignedToId || lead.assignedTo?.id;
      const name = lead.assignedTo?.name;
      if (id && name) empMap[id] = { id, name };
    });

    return {
      name,
      total,
      completed,
      assignedEmployees: Object.values(empMap),
      createdAt: first?.createdAt,
    };
  }, [allLeads, pagination]);

  /* ================= FILTERED LEADS (page 1 only for list) ================= */
  const filteredLeads = useMemo(() => {
    let result = campaignLeads;

    if (selectedStatuses.length > 0) {
      result = result.filter((lead) =>
        selectedStatuses.includes(lead.status as LeadStatus),
      );
    }

    if (selectedEmployees.length > 0) {
      result = result.filter((lead) => {
        const empId = (lead as any).assignedToId || lead.assignedTo?.id;
        return empId && selectedEmployees.includes(empId);
      });
    }

    return result;
  }, [campaignLeads, selectedStatuses, selectedEmployees]);

  /* ================= LEAD DETAILS ================= */
  const { data: leadDetails } = useQuery({
    queryKey: ["leadDetails", selectedLead?.id],
    queryFn: () => fetchLeadById(selectedLead!.id),
    enabled: !!selectedLead,
  });

  /* ================= MUTATIONS ================= */
  const updateStatusMutation = useMutation({
    mutationFn: ({ leadId, status, remark }: any) =>
      changeLeadStatus(leadId, { status, remark }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", campaignId] });
      qc.invalidateQueries({ queryKey: ["leads-all", campaignId] });
      qc.invalidateQueries({ queryKey: ["leadDetails"] });
    },
  });

  const logCallMutation = useMutation({
    mutationFn: ({ leadId, outcomeId, remark }: any) =>
      logCall(leadId, { outcomeId, remark }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads", campaignId] });
      qc.invalidateQueries({ queryKey: ["leads-all", campaignId] });
      qc.invalidateQueries({ queryKey: ["leadDetails"] });
    },
  });

  /* ================= RENDER ================= */
  return (
    <div className="flex h-screen bg-gray-50">
      <FiltersSidebar
        leads={allLeads} // all pages → accurate charts
        campaignInfo={campaignInfo}
        pipeline={pipeline}
        selectedStatuses={selectedStatuses}
        selectedEmployees={selectedEmployees}
        setSelectedStatuses={setSelectedStatuses}
        setSelectedEmployees={setSelectedEmployees}
      />

      <LeadsList
        leads={filteredLeads} // page 1 only → list
        loading={isLoading}
        selectedLead={selectedLead}
        onSelectLead={setSelectedLead}
      />

      {leadDetails && (
        <LeadDetailsPanel
          lead={leadDetails}
          pipeline={pipeline}
          onUpdate={(data) => {
            if (data.outcomeId) {
              logCallMutation.mutate({
                leadId: leadDetails.id,
                outcomeId: data.outcomeId,
                remark: data.remark,
              });
            } else if (data.status !== leadDetails.status) {
              updateStatusMutation.mutate({
                leadId: leadDetails.id,
                status: data.status,
                remark: data.remark,
              });
            }
          }}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}
