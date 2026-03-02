import { RefreshCw, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import StatusFilter from "./StatusFilter";

import { useLeadsTableStore } from "@/hooks/useLeadsTableStore";

interface Props {
  campaignId: string;
  onBulkAssign: () => void;
}

export default function LeadsToolbar({ campaignId, onBulkAssign }: Props) {
  const queryClient = useQueryClient();
  const selectedCount = useLeadsTableStore((s) => s.selectedIds.length);

  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: ["leads", campaignId],
    });
  };

  return (
    <div className="space-y-3">
      {/* TOP BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* LEFT FILTERS */}
        <div className="flex flex-wrap gap-2">
          <StatusFilter />
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-2">
          {/* REFRESH */}
          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          {/* BULK ASSIGN */}
          <Button
            onClick={() => onBulkAssign()}
            className="bg-[#b98b08] hover:bg-[#a47a07] flex gap-2"
          >
            <Users className="h-4 w-4" />
            Bulk Assign
          </Button>
        </div>
      </div>

      <Separator />
    </div>
  );
}
