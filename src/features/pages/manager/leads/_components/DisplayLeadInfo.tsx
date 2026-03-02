import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import LeadFiltersBar from "./LeadFiltersBar";
import SubFilters from "./SubFilters";
import LeadsDataTable from "./LeadsTable";
import LeadsPagination from "./LeadsPagination";
import { LeadStatus, CallOutcome } from "../../../../..//types/leads.types";
import {
  fetchLeads,
  assignLeads,
} from "../../../../..//services/leads.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const PAGE_SIZE = 50; // ✅ 50 per page

export default function DisplayLeadInfo() {
  const qc = useQueryClient();

  const [statuses, setStatuses] = useState<LeadStatus[]>(["FRESH"]);
  const [outcomes, setOutcomes] = useState<CallOutcome[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [filterEmployeeIds, setFilterEmployeeIds] = useState<string[]>([]);
  const [rangeFrom, setRangeFrom] = useState<number | "">("");
  const [rangeTo, setRangeTo] = useState<number | "">("");
  const [page, setPage] = useState(1);

  const showSubFilters = statuses.includes("IN_PROGRESS");

  /**
   * 🔥 FETCH ALL LEADS AT ONCE
   * Backend expects comma-separated strings for arrays
   */
  const { data, isLoading } = useQuery({
    queryKey: ["leads", statuses, outcomes, filterEmployeeIds],
    queryFn: () =>
      fetchLeads({
        statuses,
        outcomes,
        employeeIds:
          filterEmployeeIds.length > 0 ? filterEmployeeIds : undefined,
        limit: 100_000, // fetch all once
      }),
    staleTime: 5 * 60 * 1000,
  });

  const allLeads = data?.data ?? [];

  /**
   * 🔢 CLIENT-SIDE PAGINATION
   */
  const totalPages = Math.ceil(allLeads.length / PAGE_SIZE);

  const paginatedLeads = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return allLeads.slice(start, start + PAGE_SIZE);
  }, [allLeads, page]);

  /**
   * 🔥 Used for RANGE selection across pages
   */
  const allLeadIds = useMemo(() => allLeads.map((l) => l.id), [allLeads]);

  const assignMutation = useMutation({
    mutationFn: assignLeads,
    onSuccess: (res) => {
      toast.success(`${res.count} Leads Assigned`);
      setSelectedLeadIds([]);
      setSelectedEmployeeIds([]);
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <LeadFiltersBar
        allLeadIds={allLeadIds} // ✅ IMPORTANT
        statuses={statuses}
        setStatuses={setStatuses}
        selectedLeadIds={selectedLeadIds}
        setSelectedLeadIds={setSelectedLeadIds}
        rangeFrom={rangeFrom}
        rangeTo={rangeTo}
        setRangeFrom={setRangeFrom}
        setRangeTo={setRangeTo}
        selectedEmployeeIds={selectedEmployeeIds}
        setSelectedEmployeeIds={setSelectedEmployeeIds}
        filterEmployeeIds={filterEmployeeIds}
        setFilterEmployeeIds={setFilterEmployeeIds}
        onAssign={() =>
          assignMutation.mutate({
            leadIds: selectedLeadIds,
            employeeIds: selectedEmployeeIds,
          })
        }
        isAssigning={assignMutation.isPending}
      />

      {showSubFilters && (
        <SubFilters outcomes={outcomes} setOutcomes={setOutcomes} />
      )}

      <LeadsDataTable
        leads={paginatedLeads}
        loading={isLoading}
        selectedLeadIds={selectedLeadIds}
        setSelectedLeadIds={setSelectedLeadIds}
      />

      <LeadsPagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
