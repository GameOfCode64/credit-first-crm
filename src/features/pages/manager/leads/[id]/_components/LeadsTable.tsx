import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import LeadsToolbar from "./LeadsToolbar";
import BulkAssignSheet from "./BulkAssignSheet";
import LeadDetailSheet from "./LeadDetailSheet";
import { useLeadsTableStore } from "@/hooks/useLeadsTableStore";

interface Props {
  campaignId: string;
  data: any[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  isLoading: boolean;
  page: number;
  setPage: (page: number) => void;
}

export default function LeadsTable({
  campaignId,
  data,
  pagination,
  isLoading,
  page,
  setPage,
}: Props) {
  const { selectedIds, toggleSelect, clearSelection } = useLeadsTableStore();
  const [openAssign, setOpenAssign] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const safeData = Array.isArray(data) ? data : [];

  const allSelected =
    safeData.length > 0 &&
    safeData.every((l: any) => selectedIds.includes(l.id));

  const toggleAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      safeData.forEach((l: any) => {
        if (!selectedIds.includes(l.id)) {
          toggleSelect(l.id);
        }
      });
    }
  };

  const handleRowClick = (leadId: string, event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (
      target.closest('button[role="checkbox"]') ||
      target.closest("[data-radix-collection-item]")
    ) {
      return;
    }

    setSelectedLeadId(leadId);
    setOpenDetail(true);
  };

  return (
    <div className="space-y-4">
      <LeadsToolbar
        campaignId={campaignId}
        onBulkAssign={() => setOpenAssign(true)}
      />

      <div className="rounded-md border bg-white overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
              </TableHead>

              <TableHead>Person Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Company Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created At</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#b98b08]"></div>
                    <span className="text-gray-600">Loading leads...</span>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && safeData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  No leads found
                </TableCell>
              </TableRow>
            )}

            {safeData.map((lead: any) => (
              <TableRow
                key={lead.id}
                onClick={(e) => handleRowClick(lead.id, e)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(lead.id)}
                    onCheckedChange={() => toggleSelect(lead.id)}
                  />
                </TableCell>

                <TableCell className="font-medium">
                  {lead.personName ?? "—"}
                </TableCell>
                <TableCell>{lead.phone ?? "—"}</TableCell>
                <TableCell>{lead.companyName ?? "—"}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fef9e7] text-[#7d6006] border border-[#b98b08]/30">
                    {lead.status ?? "—"}
                  </span>
                </TableCell>
                <TableCell>
                  {lead.assignedTo?.name ?? (
                    <span className="text-gray-400 italic">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-gray-600">
                  {lead.createdAt
                    ? new Date(lead.createdAt).toLocaleDateString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of{" "}
            {Math.ceil(pagination.total / pagination.limit)} • Total{" "}
            {pagination.total} leads
          </span>

          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>

            <Button
              variant="outline"
              disabled={page * pagination.limit >= pagination.total}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <BulkAssignSheet
        open={openAssign}
        onClose={() => {
          setOpenAssign(false);
        }}
        campaignId={campaignId}
      />

      <LeadDetailSheet
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setSelectedLeadId(null);
        }}
        leadId={selectedLeadId}
      />
    </div>
  );
}
